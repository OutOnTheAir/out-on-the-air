'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import CountryPicker from '@/components/CountryPicker'
import { cleanCallsign, isPlausibleCallsign } from '@/lib/callsign'
import { parseDxccList } from '@/lib/dxcc'

// ============================================================
// Edit one of your own activations.
//
// Notes on how this treats the qsos table:
//  - qsos has no DELETE policy, so this page never deletes QSO rows.
//  - If the activation has no QSO rows, adding a band and mode creates
//    one synthetic row, the same way the Log an Activation form does.
//  - If the activation has exactly one QSO row and it is a synthetic
//    one (chaser_call UNKNOWN, or the air to air callsign), that row is
//    updated to follow the activation.
//  - If the activation has real QSOs (an ADIF import), band, mode, time
//    and QSO count are locked, because they are derived from those rows.
//    Everything else stays editable.
// ============================================================

const LOCATION_TYPES = ['Park', 'Beach', 'Rooftop', 'Parking Lot', 'Rural', 'Vehicle', 'Vessel', 'Other']
const HF_BANDS = ['2200m', '630m', '160m', '80m', '60m', '40m', '30m', '20m', '17m', '15m', '12m', '10m', '6m']
const VHF_UHF_BANDS = ['2m', '1.25m', '70cm', '33cm', '23cm']
const MODES = ['SSB', 'CW', 'AM', 'FM Simplex', 'Satellite Voice']

// Maps the activation-level mode buttons to the per-QSO mode value.
// qsos.mode only allows SSB, AM, FM, CW.
const MODE_TO_QSO_MODE: Record<string, string> = {
  'SSB':             'SSB',
  'CW':              'CW',
  'AM':              'AM',
  'FM Simplex':      'FM',
  'Satellite Voice': 'SSB',
}

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
]

const CONTINENTS = ['NA', 'SA', 'EU', 'AF', 'AS', 'OC', 'AN']
const CONTINENT_LABELS: Record<string, string> = {
  NA: 'North America', SA: 'South America', EU: 'Europe',
  AF: 'Africa', AS: 'Asia', OC: 'Oceania', AN: 'Antarctica',
}

type PageState = 'loading' | 'notfound' | 'ready'
type SaveStatus = 'idle' | 'saving' | 'success' | 'error'

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.03)',
  border: '0.5px solid var(--border)',
  color: 'var(--text)',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.85rem',
  padding: '0.85rem 1rem',
  outline: 'none',
  boxSizing: 'border-box' as const,
}

const labelStyle = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.6rem',
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
  color: 'var(--text-dim)',
  display: 'block',
  marginBottom: '0.5rem',
}

const hintStyle = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.58rem',
  color: 'var(--text-dim)',
  marginTop: '0.4rem',
  opacity: 0.6,
}

const isVHFUHF = (band: string) => VHF_UHF_BANDS.includes(band)

function locTypeLabel(dbValue: string | null | undefined): string {
  if (!dbValue) return 'Other'
  return LOCATION_TYPES.find(t => t.toLowerCase().replace(/ /g, '_') === dbValue.toLowerCase()) ?? 'Other'
}

function splitList(value: string | null | undefined): string[] {
  if (!value) return []
  return value.split(',').map(s => s.trim().toUpperCase()).filter(Boolean)
}

// Pulls HH:MM (UTC) out of a stored timestamp. Noon is what the forms store
// when no time was given, so it is shown as blank.
function timeFromIso(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const mm = String(d.getUTCMinutes()).padStart(2, '0')
  if (hh === '12' && mm === '00') return ''
  return `${hh}:${mm}`
}

export default function EditActivationPage() {
  const params = useParams<{ id: string }>()
  const activationId = params?.id as string | undefined

  const [pageState, setPageState] = useState<PageState>('loading')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [message, setMessage]     = useState('')
  const [warning, setWarning]     = useState('')

  const [userId, setUserId]       = useState<string | null>(null)
  const [callsign, setCallsign]   = useState('')

  // How this activation's QSO rows are handled (see header comment).
  const [qsoMode, setQsoMode]     = useState<'none' | 'synthetic' | 'locked'>('none')
  const [originalA2a, setOriginalA2a] = useState('')

  const [date, setDate]           = useState('')
  const [timeUtc, setTimeUtc]     = useState('')
  const [locType, setLocType]     = useState('Other')
  const [locDesc, setLocDesc]     = useState('')
  const [grid, setGrid]           = useState('')
  const [band, setBand]           = useState('')
  const [mode, setMode]           = useState('')
  const [qsoCount, setQsoCount]   = useState('')
  const [powerWatts, setPowerWatts] = useState('')
  const [satelliteName, setSatelliteName] = useState('')
  const [tempF, setTempF]         = useState('')
  const [notes, setNotes]         = useState('')
  const [selectedStates, setSelectedStates]         = useState<string[]>([])
  const [selectedContinents, setSelectedContinents] = useState<string[]>([])
  const [selectedDxcc, setSelectedDxcc]             = useState<string[]>([])
  const [isA2a, setIsA2a]         = useState(false)
  const [a2aCall, setA2aCall]     = useState('')

  const vhfSelected = isVHFUHF(band)
  const locked      = qsoMode === 'locked'

  function toggleState(s: string) {
    setSelectedStates(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }
  function toggleContinent(c: string) {
    setSelectedContinents(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  }

  useEffect(() => {
    if (!activationId) return

    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        window.location.href = '/login'
        return
      }

      const uid = data.session.user.id
      const cs  = data.session.user.user_metadata?.callsign ?? ''
      setUserId(uid)
      setCallsign(cs)

      const { data: act, error: actError } = await supabase
        .from('activations')
        .select('*')
        .eq('id', activationId)
        .maybeSingle()

      // Only the owner can edit. The database enforces this too.
      if (actError || !act || act.user_id !== uid) {
        setPageState('notfound')
        return
      }

      // Look at up to two QSO rows to decide how band, mode and time are handled.
      const { data: qsoRows } = await supabase
        .from('qsos')
        .select('chaser_call, qso_datetime')
        .eq('activation_id', activationId)
        .limit(2)

      const rows = qsoRows ?? []
      let kind: 'none' | 'synthetic' | 'locked' = 'none'
      let loadedTime = ''
      if (rows.length === 1) {
        const call = (rows[0].chaser_call ?? '').toUpperCase()
        const a2a  = (act.a2a_callsign ?? '').toUpperCase()
        if (call === 'UNKNOWN' || (a2a !== '' && call === a2a)) {
          kind = 'synthetic'
          loadedTime = timeFromIso(rows[0].qso_datetime)
        } else {
          kind = 'locked'
        }
      } else if (rows.length > 1) {
        kind = 'locked'
      }
      setQsoMode(kind)

      setDate(String(act.activation_date ?? '').split('T')[0])
      setTimeUtc(loadedTime)
      setLocType(locTypeLabel(act.location_type))
      setLocDesc(act.location_desc ?? '')
      setGrid(act.grid_square ?? '')
      setBand(act.band ?? '')
      setMode(act.mode ?? '')
      setQsoCount(act.qso_count != null ? String(act.qso_count) : '')
      setPowerWatts(act.power_watts != null ? String(act.power_watts) : '')
      setSatelliteName(act.satellite_name ?? '')
      setTempF(act.temp_fahrenheit != null ? String(act.temp_fahrenheit) : '')
      setNotes(act.notes ?? '')
      setSelectedStates(splitList(act.contacted_states))
      setSelectedContinents(splitList(act.contacted_continents))
      setSelectedDxcc(parseDxccList(act.contacted_dxcc))
      const a2aSaved = cleanCallsign(act.a2a_callsign ?? '')
      setOriginalA2a(a2aSaved)
      setIsA2a(a2aSaved !== '')
      setA2aCall(a2aSaved)

      setPageState('ready')
    })
  }, [activationId])

  const parsedTempF = tempF !== '' ? parseInt(tempF) : null

  async function handleSave() {
    if (!activationId || !userId) { setSaveStatus('error'); setMessage('Session expired. Please log in again.'); return }
    if (!date)                    { setSaveStatus('error'); setMessage('Activation date is required.'); return }
    if (!locDesc.trim())          { setSaveStatus('error'); setMessage('Location description is required.'); return }
    if (!qsoCount || parseInt(qsoCount) < 1) { setSaveStatus('error'); setMessage('QSO count must be at least 1.'); return }
    if (tempF !== '' && (isNaN(parseInt(tempF)) || parseInt(tempF) < -100 || parseInt(tempF) > 160)) {
      setSaveStatus('error'); setMessage('Temperature must be between -100°F and 160°F.'); return
    }
    if (timeUtc !== '' && !/^\d{2}:\d{2}$/.test(timeUtc)) {
      setSaveStatus('error'); setMessage('Activation time must be in HH:MM format.'); return
    }

    // A synthetic QSO row cannot be deleted and its band and mode cannot be
    // blank, so once it exists the activation keeps a band and mode.
    if (qsoMode === 'synthetic' && (!band || !mode)) {
      setSaveStatus('error')
      setMessage('This activation already has a band and mode on record, so they cannot be cleared. Pick a different value instead.')
      return
    }

    const a2aClean = isA2a ? cleanCallsign(a2aCall) : ''
    if (isA2a) {
      if (!isPlausibleCallsign(a2aClean)) {
        setSaveStatus('error'); setMessage('Enter the other OOTA activator\'s callsign, for example KC1NHE.'); return
      }
      if (a2aClean === cleanCallsign(callsign)) {
        setSaveStatus('error'); setMessage('The air to air callsign must be the other activator, not your own.'); return
      }
    }

    setSaveStatus('saving')
    setMessage('')
    setWarning('')

    // Fields that depend on band, mode or QSO count are left alone when the
    // activation has real imported QSO rows.
    const update: Record<string, any> = {
      activation_date:      date,
      location_type:        locType.toLowerCase().replace(/ /g, '_'),
      location_desc:        locDesc.trim(),
      grid_square:          grid.trim().toUpperCase() || null,
      power_watts:          powerWatts ? parseInt(powerWatts) : null,
      satellite_name:       satelliteName.trim() || null,
      notes:                notes.trim() || null,
      temp_fahrenheit:      parsedTempF,
      contacted_states:     selectedStates.length > 0 ? selectedStates.join(',') : null,
      contacted_continents: selectedContinents.length > 0 ? selectedContinents.join(',') : null,
      contacted_dxcc:       selectedDxcc.length > 0 ? selectedDxcc.join(',') : null,
      a2a_callsign:         a2aClean || null,
    }
    if (!locked) {
      update.band            = band || null
      update.mode            = mode || null
      update.is_simplex      = vhfSelected
      update.qso_count       = parseInt(qsoCount)
      update.is_successful   = parseInt(qsoCount) >= 1
    }

    const { error: updateError } = await supabase
      .from('activations')
      .update(update)
      .eq('id', activationId)
      .eq('user_id', userId)

    if (updateError) {
      setSaveStatus('error')
      setMessage(`Error: ${updateError.message} (code: ${updateError.code})`)
      console.error(updateError)
      return
    }

    // ── QSO rows ──────────────────────────────────────────────
    const qsoTime     = timeUtc !== '' ? `${timeUtc}:00` : '12:00:00'
    const qsoDatetime = `${date}T${qsoTime}Z`
    const qsoWarnings: string[] = []

    if (qsoMode === 'none' && band && mode) {
      const { error: insError } = await supabase.from('qsos').insert({
        activation_id:  activationId,
        activator_call: callsign,
        chaser_call:    a2aClean || 'UNKNOWN',
        qso_datetime:   qsoDatetime,
        band:           band,
        mode:           MODE_TO_QSO_MODE[mode] ?? mode,
        satellite_name: satelliteName.trim() || null,
        is_a2a:         isA2a,
        is_confirmed:   false,
      })
      if (insError) {
        console.error('Failed to add QSO row', insError)
        qsoWarnings.push('The activation was saved, but its contact record could not be added.')
      } else {
        setQsoMode('synthetic')
      }
    } else if (qsoMode === 'synthetic') {
      // There is exactly one row for this activation, so matching on
      // activation_id alone updates just that row.
      const { error: qsoUpdError } = await supabase
        .from('qsos')
        .update({
          chaser_call:    a2aClean || 'UNKNOWN',
          qso_datetime:   qsoDatetime,
          band:           band,
          mode:           MODE_TO_QSO_MODE[mode] ?? mode,
          satellite_name: satelliteName.trim() || null,
          is_a2a:         isA2a,
        })
        .eq('activation_id', activationId)
      if (qsoUpdError) {
        console.error('Failed to update QSO row', qsoUpdError)
        qsoWarnings.push('The activation was saved, but its contact record could not be updated.')
      }
    } else if (qsoMode === 'locked' && a2aClean !== originalA2a) {
      // Imported activation: keep the per-QSO air to air flag in step with
      // the callsign. Clear old flags first, then flag the matching contact.
      const { error: clearError } = await supabase
        .from('qsos')
        .update({ is_a2a: false })
        .eq('activation_id', activationId)
        .eq('is_a2a', true)
      if (clearError) {
        console.error('Failed to clear air to air flags', clearError)
        qsoWarnings.push('The activation was saved, but the old air to air flag could not be cleared.')
      }
      if (a2aClean !== '') {
        const { error: flagError } = await supabase
          .from('qsos')
          .update({ is_a2a: true })
          .eq('activation_id', activationId)
          .eq('chaser_call', a2aClean)
        if (flagError) {
          console.error('Failed to flag air to air contact', flagError)
        }
      }
    }

    setOriginalA2a(a2aClean)
    if (qsoWarnings.length > 0) setWarning(qsoWarnings.join(' '))
    setSaveStatus('success')
  }

  // ── Render ──────────────────────────────────────────────────

  if (pageState === 'loading') {
    return (
      <main style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
        <Nav />
        <section style={{ padding: '8rem 2rem', textAlign: 'center' }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--text-dim)' }}>
            Loading activation…
          </p>
        </section>
        <Footer />
      </main>
    )
  }

  if (pageState === 'notfound') {
    return (
      <main style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
        <Nav />
        <section style={{ padding: '8rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--amber)', marginBottom: '1rem' }}>
            Activation not found.
          </p>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', lineHeight: 1.8, color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
            It may have been deleted, or it belongs to another operator. You can only edit your own activations.
          </p>
          <a href="/log" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'var(--amber)', color: '#0a0e14', padding: '0.75rem 1.5rem', textDecoration: 'none' }}>
            Back to the Log
          </a>
        </section>
        <Footer />
      </main>
    )
  }

  const busy = saveStatus === 'saving'

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <Nav />

      <section style={{ padding: '5rem 2rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--amber)', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <span style={{ display: 'inline-block', width: '2rem', height: '0.5px', background: 'var(--amber)' }} />
          Edit an Activation
        </p>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 700, lineHeight: 1.1,
          color: 'var(--text)', marginBottom: '1rem',
        }}>
          Fix it or fill it in.<br />
          <em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>Keep the record true.</em>
        </h1>

        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', lineHeight: 1.8, color: 'var(--text-dim)', marginBottom: '1rem' }}>
          Editing as <strong style={{ color: 'var(--amber)' }}>{callsign}</strong>
        </p>

        {locked && (
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', lineHeight: 1.7, color: 'var(--amber)', border: '0.5px solid var(--amber)', padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>
            This activation came from an imported log, so its band, mode, time and QSO count are read from your contacts and are locked. Everything else can be edited.
          </p>
        )}

        {saveStatus !== 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Activation Date */}
            <div>
              <label style={labelStyle}>
                Activation Date <span style={{ color: 'var(--amber)' }}>*</span>
              </label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                disabled={busy} style={inputStyle}
              />
            </div>

            {/* Activation Time (UTC) */}
            {!locked && (
              <div>
                <label style={labelStyle}>
                  Activation Time, UTC <span style={{ opacity: 0.4 }}>(optional)</span>
                </label>
                <input type="time" value={timeUtc} onChange={e => setTimeUtc(e.target.value)}
                  disabled={busy} style={inputStyle}
                />
                <p style={hintStyle}>
                  Used for Night Owl (0000 to 0400 UTC) and Midnight Herald. Leave blank if unsure.
                </p>
              </div>
            )}

            {/* Location Type */}
            <div>
              <label style={labelStyle}>
                Location Type <span style={{ color: 'var(--amber)' }}>*</span>
              </label>
              <select value={locType} onChange={e => setLocType(e.target.value)}
                disabled={busy}
                style={{ ...inputStyle, background: '#0a0e14' }}
              >
                {LOCATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Location Description */}
            <div>
              <label style={labelStyle}>
                Location Description <span style={{ color: 'var(--amber)' }}>*</span>
              </label>
              <input type="text" value={locDesc} onChange={e => setLocDesc(e.target.value)}
                placeholder="e.g. Waterfront Park, New Haven, CT"
                disabled={busy} style={inputStyle}
              />
            </div>

            {/* Grid Square */}
            <div>
              <label style={labelStyle}>
                Grid Square <span style={{ opacity: 0.4 }}>(optional)</span>
              </label>
              <input type="text" value={grid} onChange={e => setGrid(e.target.value.toUpperCase())}
                placeholder="e.g. FN57" maxLength={6}
                disabled={busy}
                style={{ ...inputStyle, letterSpacing: '0.15em' }}
              />
            </div>

            {/* Band */}
            {!locked && (
              <div>
                <label style={labelStyle}>
                  Band <span style={{ opacity: 0.4 }}>(optional)</span>
                </label>
                <select value={band} onChange={e => setBand(e.target.value)}
                  disabled={busy}
                  style={{ ...inputStyle, background: '#0a0e14' }}
                >
                  <option value="">Select band</option>
                  <optgroup label="HF">
                    {HF_BANDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </optgroup>
                  <optgroup label="VHF / UHF, Simplex Only">
                    {VHF_UHF_BANDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </optgroup>
                </select>
                {vhfSelected && (
                  <p style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: '0.58rem',
                    color: 'var(--amber)', marginTop: '0.4rem',
                    border: '0.5px solid var(--amber)', padding: '0.5rem 0.75rem',
                  }}>
                    VHF/UHF simplex only. Repeater contacts are not eligible for OOTA.
                  </p>
                )}
                <p style={hintStyle}>
                  Adding a band and mode to an older activation is what makes it count toward the band and mode awards.
                </p>
              </div>
            )}

            {/* Mode */}
            {!locked && (
              <div>
                <label style={labelStyle}>
                  Mode <span style={{ opacity: 0.4 }}>(needed together with band for mode awards)</span>
                </label>
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: '0.5rem',
                  padding: '0.75rem', border: '0.5px solid var(--border)',
                  background: 'rgba(255,255,255,0.02)',
                }}>
                  {MODES.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      disabled={busy}
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.65rem', letterSpacing: '0.08em',
                        padding: '0.35rem 0.85rem',
                        border: '0.5px solid',
                        borderColor: mode === m ? 'var(--amber)' : 'var(--border)',
                        color: mode === m ? 'var(--amber)' : 'var(--text-dim)',
                        background: mode === m ? 'rgba(212,175,55,0.08)' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* QSO Count */}
            {!locked && (
              <div>
                <label style={labelStyle}>
                  QSO Count <span style={{ color: 'var(--amber)' }}>*</span>
                </label>
                <input type="number" value={qsoCount} onChange={e => setQsoCount(e.target.value)}
                  placeholder="0" min={1}
                  disabled={busy} style={inputStyle}
                />
              </div>
            )}

            {/* Power */}
            <div>
              <label style={labelStyle}>
                TX Power, Watts <span style={{ opacity: 0.4 }}>(optional)</span>
              </label>
              <input type="number" value={powerWatts} onChange={e => setPowerWatts(e.target.value)}
                placeholder="e.g. 5" min={1} max={1500}
                disabled={busy} style={inputStyle}
              />
              <p style={hintStyle}>QRP is 5W or less. Needed for the QRP awards.</p>
            </div>

            {/* Satellite Name */}
            <div>
              <label style={labelStyle}>
                Satellite Name <span style={{ opacity: 0.4 }}>(optional, satellite contacts only)</span>
              </label>
              <input type="text" value={satelliteName} onChange={e => setSatelliteName(e.target.value.toUpperCase())}
                placeholder="e.g. ISS, SO-50, AO-91"
                disabled={busy}
                style={{ ...inputStyle, letterSpacing: '0.05em' }}
              />
            </div>

            {/* Contacted States */}
            <div>
              <label style={labelStyle}>
                Contacted States <span style={{ opacity: 0.4 }}>(optional, for The 50 award)</span>
              </label>
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '0.35rem',
                padding: '0.75rem', border: '0.5px solid var(--border)',
                background: 'rgba(255,255,255,0.02)',
              }}>
                {US_STATES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleState(s)}
                    disabled={busy}
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.6rem', letterSpacing: '0.05em',
                      padding: '0.25rem 0.5rem',
                      border: '0.5px solid',
                      borderColor: selectedStates.includes(s) ? 'var(--amber)' : 'var(--border)',
                      color: selectedStates.includes(s) ? 'var(--amber)' : 'var(--text-dim)',
                      background: selectedStates.includes(s) ? 'rgba(212,175,55,0.08)' : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {selectedStates.length > 0 && (
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.58rem', color: 'var(--amber)', marginTop: '0.4rem' }}>
                  {selectedStates.length} state{selectedStates.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            {/* Contacted Continents */}
            <div>
              <label style={labelStyle}>
                Contacted Continents <span style={{ opacity: 0.4 }}>(optional, for World Tour award)</span>
              </label>
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '0.5rem',
                padding: '0.75rem', border: '0.5px solid var(--border)',
                background: 'rgba(255,255,255,0.02)',
              }}>
                {CONTINENTS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleContinent(c)}
                    disabled={busy}
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.6rem', letterSpacing: '0.05em',
                      padding: '0.35rem 0.75rem',
                      border: '0.5px solid',
                      borderColor: selectedContinents.includes(c) ? 'var(--amber)' : 'var(--border)',
                      color: selectedContinents.includes(c) ? 'var(--amber)' : 'var(--text-dim)',
                      background: selectedContinents.includes(c) ? 'rgba(212,175,55,0.08)' : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    {c} <span style={{ opacity: 0.5, fontSize: '0.55rem' }}>({CONTINENT_LABELS[c]})</span>
                  </button>
                ))}
              </div>
              {selectedContinents.length > 0 && (
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.58rem', color: 'var(--amber)', marginTop: '0.4rem' }}>
                  {selectedContinents.length} continent{selectedContinents.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            {/* Contacted Countries */}
            <div>
              <label style={labelStyle}>
                Contacted Countries <span style={{ opacity: 0.4 }}>(optional, for the DXCC awards)</span>
              </label>
              <CountryPicker value={selectedDxcc} onChange={setSelectedDxcc} disabled={busy} />
              <p style={hintStyle}>
                Search and add each country you made contact with during this activation. Honor system.
              </p>
            </div>

            {/* Air to Air */}
            <div>
              <label style={labelStyle}>
                Air to Air <span style={{ opacity: 0.4 }}>(optional, for the Air to Air award)</span>
              </label>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer',
                fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--text)',
                marginBottom: isA2a ? '0.75rem' : 0,
              }}>
                <input type="checkbox" checked={isA2a} onChange={e => setIsA2a(e.target.checked)}
                  disabled={busy}
                  style={{ accentColor: 'var(--amber)', cursor: 'pointer' }}
                />
                I worked another OOTA activator who was also out on the air
              </label>
              {isA2a && (
                <input type="text" value={a2aCall} onChange={e => setA2aCall(cleanCallsign(e.target.value))}
                  placeholder="Their callsign, e.g. KC1NHE" maxLength={14}
                  disabled={busy}
                  style={{ ...inputStyle, letterSpacing: '0.1em' }}
                />
              )}
              <p style={hintStyle}>
                Both of you out on the air at the same time. Honor system.
              </p>
            </div>

            {/* Temperature */}
            <div>
              <label style={labelStyle}>
                Temperature, °F <span style={{ opacity: 0.4 }}>(optional, honor system)</span>
              </label>
              <input type="number" value={tempF} onChange={e => setTempF(e.target.value)}
                placeholder="e.g. 28"
                min={-100} max={160}
                disabled={busy} style={inputStyle}
              />
              <p style={hintStyle}>
                Needed for Blizzard, Penguin, Solar Flare, and Heatstroke.
              </p>
            </div>

            {/* Notes */}
            <div>
              <label style={labelStyle}>
                Notes <span style={{ opacity: 0.4 }}>(optional)</span>
              </label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Conditions, antenna, anything worth noting…" rows={3}
                disabled={busy}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {saveStatus === 'error' && (
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', lineHeight: 1.6, color: '#ff6b6b', border: '0.5px solid #ff6b6b', padding: '0.75rem 1rem' }}>
                {message}
              </p>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <a href="/log" style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'var(--text-dim)', textDecoration: 'none',
                border: '0.5px solid var(--border)', padding: '1rem 1.5rem',
                textAlign: 'center',
              }}>
                Cancel
              </a>
              <button onClick={handleSave} disabled={busy}
                style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', fontWeight: 500,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  background: busy ? 'rgba(255,255,255,0.1)' : 'var(--amber)',
                  color: busy ? 'var(--text-dim)' : '#0a0e14',
                  border: 'none', padding: '1rem 2rem',
                  cursor: busy ? 'not-allowed' : 'pointer',
                  flex: 1, transition: 'opacity 0.2s',
                }}
              >
                {busy ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {saveStatus === 'success' && (
          <div style={{ border: '0.5px solid var(--amber)', padding: '2rem', textAlign: 'center' }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--amber)', marginBottom: '1rem' }}>
              Changes saved.
            </p>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', lineHeight: 1.8, color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
              73, {callsign}. The record is updated.
            </p>
            {warning && (
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', lineHeight: 1.7, color: '#ff6b6b', marginBottom: '1.5rem' }}>
                {warning}
              </p>
            )}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/log" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'var(--amber)', color: '#0a0e14', padding: '0.75rem 1.5rem', textDecoration: 'none' }}>
                View the Log
              </a>
              <a href="/awards" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--amber)', textDecoration: 'none', border: '0.5px solid var(--amber)', padding: '0.75rem 1.5rem' }}>
                Check Awards
              </a>
              <button onClick={() => setSaveStatus('idle')} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', background: 'transparent', border: '0.5px solid var(--border)', padding: '0.75rem 1.5rem', cursor: 'pointer' }}>
                Keep Editing
              </button>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}
