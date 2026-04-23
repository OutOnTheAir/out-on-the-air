'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const LOCATION_TYPES = ['Park', 'Beach', 'Rooftop', 'Parking Lot', 'Rural', 'Vehicle', 'Vessel', 'Other']
const HF_BANDS = ['2200m', '630m', '160m', '80m', '60m', '40m', '30m', '20m', '17m', '15m', '12m', '10m', '6m']
const VHF_UHF_BANDS = ['2m', '1.25m', '70cm', '33cm', '23cm']

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

type Status = 'idle' | 'submitting' | 'success' | 'error'

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

function celsiusFromF(f: number) {
  return Math.round((f - 32) * 5 / 9)
}

function tempLabel(f: number | null): string {
  if (f === null) return ''
  const c = celsiusFromF(f)
  return `${f}°F (${c}°C)`
}

const isVHFUHF = (band: string) => VHF_UHF_BANDS.includes(band)

export default function SpotNewPage() {
  const [callsign, setCallsign]           = useState('')
  const [userId, setUserId]               = useState<string | null>(null)
  const [authReady, setAuthReady]         = useState(false)
  const [status, setStatus]               = useState<Status>('idle')
  const [message, setMessage]             = useState('')

  const [date, setDate]                   = useState(new Date().toISOString().split('T')[0])
  const [locType, setLocType]             = useState('Park')
  const [locDesc, setLocDesc]             = useState('')
  const [grid, setGrid]                   = useState('')
  const [band, setBand]                   = useState('')
  const [qsoCount, setQsoCount]           = useState('')
  const [powerWatts, setPowerWatts]       = useState('')
  const [satelliteName, setSatelliteName] = useState('')
  const [tempF, setTempF]                 = useState('')
  const [notes, setNotes]                 = useState('')
  const [selectedStates, setSelectedStates]         = useState<string[]>([])
  const [selectedContinents, setSelectedContinents] = useState<string[]>([])

  const vhfSelected = isVHFUHF(band)

  function toggleState(s: string) {
    setSelectedStates(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  function toggleContinent(c: string) {
    setSelectedContinents(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        window.location.href = '/login'
        return
      }

      const uid  = data.session.user.id
      const meta = data.session.user.user_metadata
      const cs   = meta?.callsign ?? ''

      setUserId(uid)
      setCallsign(cs)

      await supabase.from('profiles').upsert({
        id:           uid,
        callsign:     cs,
        display_name: cs,
        is_active:    true,
        created_at:   new Date().toISOString(),
      }, { onConflict: 'id' })

      await supabase.from('users').upsert({
        id:           uid,
        callsign:     cs,
        display_name: cs,
        is_active:    true,
        created_at:   new Date().toISOString(),
      }, { onConflict: 'id' })

      setAuthReady(true)
    })
  }, [])

  const parsedTempF = tempF !== '' ? parseInt(tempF) : null

  async function handleSubmit() {
    if (!locDesc.trim())                      { setStatus('error'); setMessage('Location description is required.'); return }
    if (!qsoCount || parseInt(qsoCount) < 1)  { setStatus('error'); setMessage('QSO count must be at least 1.'); return }
    if (!userId)                              { setStatus('error'); setMessage('Session expired. Please log in again.'); return }
    if (tempF !== '' && (isNaN(parseInt(tempF)) || parseInt(tempF) < -100 || parseInt(tempF) > 160)) {
      setStatus('error'); setMessage('Temperature must be between -100°F and 160°F.'); return
    }

    setStatus('submitting')
    setMessage('')

    const { error } = await supabase.from('activations').insert({
      user_id:              userId,
      callsign:             callsign,
      activation_date:      date,
      location_type:        locType.toLowerCase().replace(/ /g, '_'),
      location_desc:        locDesc.trim(),
      grid_square:          grid.trim().toUpperCase() || null,
      band:                 band || null,
      is_simplex:           vhfSelected ? true : false,
      qso_count:            parseInt(qsoCount),
      confirmed_count:      0,
      is_successful:        parseInt(qsoCount) >= 1,
      power_watts:          powerWatts ? parseInt(powerWatts) : null,
      notes:                notes.trim() || null,
      temp_fahrenheit:      parsedTempF,
      contacted_states:     selectedStates.length > 0 ? selectedStates.join(',') : null,
      contacted_continents: selectedContinents.length > 0 ? selectedContinents.join(',') : null,
      submitted_at:         new Date().toISOString(),
      created_at:           new Date().toISOString(),
    })

    if (error) {
      setStatus('error')
      setMessage(`Error: ${error.message} (code: ${error.code})`)
      console.error(error)
      return
    }

    setStatus('success')
  }

  if (!authReady) {
    return (
      <main style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
        <Nav />
        <section style={{ padding: '8rem 2rem', textAlign: 'center' }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--text-dim)' }}>
            Checking session…
          </p>
        </section>
        <Footer />
      </main>
    )
  }

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
          Log an Activation
        </p>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 700, lineHeight: 1.1,
          color: 'var(--text)', marginBottom: '1rem',
        }}>
          You were out there.<br />
          <em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>Make it official.</em>
        </h1>

        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', lineHeight: 1.8, color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
          Logging as <strong style={{ color: 'var(--amber)' }}>{callsign}</strong>
        </p>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', lineHeight: 1.8, color: 'var(--text-dim)', marginBottom: '2.5rem' }}>
          Voice, CW, or VHF/UHF simplex. Any location except your home shack. Minimum 1 QSO.
        </p>

        {status !== 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Activation Date */}
            <div>
              <label style={labelStyle}>
                Activation Date <span style={{ color: 'var(--amber)' }}>*</span>
              </label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                disabled={status === 'submitting'} style={inputStyle}
              />
            </div>

            {/* Location Type */}
            <div>
              <label style={labelStyle}>
                Location Type <span style={{ color: 'var(--amber)' }}>*</span>
              </label>
              <select value={locType} onChange={e => setLocType(e.target.value)}
                disabled={status === 'submitting'}
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
                placeholder="e.g. Waterfront Park — New Haven, CT"
                disabled={status === 'submitting'} style={inputStyle}
              />
            </div>

            {/* Grid Square */}
            <div>
              <label style={labelStyle}>
                Grid Square <span style={{ opacity: 0.4 }}>(optional)</span>
              </label>
              <input type="text" value={grid} onChange={e => setGrid(e.target.value.toUpperCase())}
                placeholder="e.g. FN57" maxLength={6}
                disabled={status === 'submitting'}
                style={{ ...inputStyle, letterSpacing: '0.15em' }}
              />
            </div>

            {/* Band */}
            <div>
              <label style={labelStyle}>
                Band <span style={{ opacity: 0.4 }}>(optional)</span>
              </label>
              <select value={band} onChange={e => setBand(e.target.value)}
                disabled={status === 'submitting'}
                style={{ ...inputStyle, background: '#0a0e14' }}
              >
                <option value="">— Select band —</option>
                <optgroup label="HF">
                  {HF_BANDS.map(b => <option key={b} value={b}>{b}</option>)}
                </optgroup>
                <optgroup label="VHF / UHF — Simplex Only">
                  {VHF_UHF_BANDS.map(b => <option key={b} value={b}>{b}</option>)}
                </optgroup>
              </select>
              {vhfSelected && (
                <p style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '0.58rem',
                  color: 'var(--amber)', marginTop: '0.4rem',
                  border: '0.5px solid var(--amber)', padding: '0.5rem 0.75rem',
                }}>
                  ⚡ VHF/UHF simplex only — repeater contacts are not eligible for OOTA.
                </p>
              )}
            </div>

            {/* QSO Count */}
            <div>
              <label style={labelStyle}>
                QSO Count <span style={{ color: 'var(--amber)' }}>*</span>
              </label>
              <input type="number" value={qsoCount} onChange={e => setQsoCount(e.target.value)}
                placeholder="0" min={1}
                disabled={status === 'submitting'} style={inputStyle}
              />
            </div>

            {/* Power */}
            <div>
              <label style={labelStyle}>
                TX Power — Watts <span style={{ opacity: 0.4 }}>(optional)</span>
              </label>
              <input type="number" value={powerWatts} onChange={e => setPowerWatts(e.target.value)}
                placeholder="e.g. 5" min={1} max={1500}
                disabled={status === 'submitting'} style={inputStyle}
              />
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.58rem', color: 'var(--text-dim)', marginTop: '0.4rem', opacity: 0.6 }}>
                QRP is ≤5W. Required to qualify for future QRP awards.
              </p>
            </div>

            {/* Satellite Name */}
            <div>
              <label style={labelStyle}>
                Satellite Name <span style={{ opacity: 0.4 }}>(optional — satellite contacts only)</span>
              </label>
              <input type="text" value={satelliteName} onChange={e => setSatelliteName(e.target.value.toUpperCase())}
                placeholder="e.g. ISS, SO-50, AO-91"
                disabled={status === 'submitting'}
                style={{ ...inputStyle, letterSpacing: '0.05em' }}
              />
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.58rem', color: 'var(--text-dim)', marginTop: '0.4rem', opacity: 0.6 }}>
                Only for voice contacts via amateur satellite or ISS on 2m/70cm.
              </p>
            </div>

            {/* Contacted States */}
            <div>
              <label style={labelStyle}>
                Contacted States <span style={{ opacity: 0.4 }}>(optional — for The 50 award)</span>
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
                    disabled={status === 'submitting'}
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
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.58rem', color: 'var(--text-dim)', marginTop: '0.4rem', opacity: 0.6 }}>
                Select US states you made contact with during this activation. Honor system.
              </p>
            </div>

            {/* Contacted Continents */}
            <div>
              <label style={labelStyle}>
                Contacted Continents <span style={{ opacity: 0.4 }}>(optional — for World Tour award)</span>
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
                    disabled={status === 'submitting'}
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
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.58rem', color: 'var(--text-dim)', marginTop: '0.4rem', opacity: 0.6 }}>
                Select continents where you made contact during this activation. Honor system.
              </p>
            </div>

            {/* Temperature */}
            <div>
              <label style={labelStyle}>
                Temperature — °F <span style={{ opacity: 0.4 }}>(optional — honor system)</span>
              </label>
              <input type="number" value={tempF} onChange={e => setTempF(e.target.value)}
                placeholder="e.g. 28"
                min={-100} max={160}
                disabled={status === 'submitting'} style={inputStyle}
              />
              {parsedTempF !== null && !isNaN(parsedTempF) && (
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.58rem', marginTop: '0.4rem', opacity: 0.8,
                  color: parsedTempF <= 0 ? '#7eb8f7' : parsedTempF <= 32 ? '#a8d4f5' : parsedTempF >= 120 ? '#ff6b6b' : parsedTempF >= 110 ? '#ffaa44' : 'var(--text-dim)'
                }}>
                  {tempLabel(parsedTempF)}
                  {parsedTempF <= 0    && ' — 🐧 Penguin territory'}
                  {parsedTempF > 0  && parsedTempF <= 32  && ' — 🌨️ Blizzard territory'}
                  {parsedTempF >= 120  && ' — 🔥 Heatstroke territory'}
                  {parsedTempF >= 110 && parsedTempF < 120 && ' — ☀️ Solar Flare territory'}
                </p>
              )}
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.58rem', color: 'var(--text-dim)', marginTop: '0.4rem', opacity: 0.6 }}>
                Required for Blizzard 🌨️, Penguin 🐧, Solar Flare ☀️, and Heatstroke 🔥 awards.
              </p>
            </div>

            {/* Notes */}
            <div>
              <label style={labelStyle}>
                Notes <span style={{ opacity: 0.4 }}>(optional)</span>
              </label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Conditions, antenna, anything worth noting…" rows={3}
                disabled={status === 'submitting'}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {status === 'error' && (
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', lineHeight: 1.6, color: '#ff6b6b', border: '0.5px solid #ff6b6b', padding: '0.75rem 1rem' }}>
                {message}
              </p>
            )}

            <button onClick={handleSubmit} disabled={status === 'submitting'}
              style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', fontWeight: 500,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                background: status === 'submitting' ? 'rgba(255,255,255,0.1)' : 'var(--amber)',
                color: status === 'submitting' ? 'var(--text-dim)' : '#0a0e14',
                border: 'none', padding: '1rem 2rem',
                cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
                width: '100%', transition: 'opacity 0.2s',
              }}
            >
              {status === 'submitting' ? 'Saving…' : 'Submit Activation'}
            </button>
          </div>
        )}

        {status === 'success' && (
          <div style={{ border: '0.5px solid var(--amber)', padding: '2rem', textAlign: 'center' }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--amber)', marginBottom: '1rem' }}>
              Activation logged.
            </p>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', lineHeight: 1.8, color: 'var(--text-dim)', marginBottom: '1rem' }}>
              73, {callsign}. It's in the record.
            </p>
            <p style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1rem', fontStyle: 'italic',
              color: 'var(--text)', lineHeight: 1.7,
              marginBottom: '1.5rem',
              padding: '1rem 1.25rem',
              borderLeft: '2px solid var(--amber)',
              textAlign: 'left',
            }}>
              Next time you're on the air — tell them.<br />
              <em style={{ color: 'var(--amber)' }}>"This is {callsign}, Out On The Air from [your location]."</em><br />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: 'var(--text-dim)', fontStyle: 'normal' }}>
                Every contact spreads the word.
              </span>
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/log" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'var(--amber)', color: '#0a0e14', padding: '0.75rem 1.5rem', textDecoration: 'none' }}>
                View the Log
              </a>
              <a href="/spot/new" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--amber)', textDecoration: 'none', border: '0.5px solid var(--amber)', padding: '0.75rem 1.5rem' }}>
                Log Another
              </a>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}
