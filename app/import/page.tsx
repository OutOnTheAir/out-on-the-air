'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

// ============================================================
// ADIF PARSER
// ============================================================

interface AdifQso {
  call:       string
  band:       string
  mode:       string
  qso_date:   string
  time_on:    string
  rst_sent:   string
  rst_rcvd:   string
  freq:       string
  sat_name:   string
  dxcc:       string
  gridsquare: string
}

function parseAdif(raw: string): AdifQso[] {
  // Strip header (everything before first <EOH>)
  const eohIdx = raw.toUpperCase().indexOf('<EOH>')
  const body   = eohIdx >= 0 ? raw.slice(eohIdx + 5) : raw

  const qsos: AdifQso[] = []
  const records = body.toUpperCase().split('<EOR>')

  for (const record of records) {
    if (!record.trim()) continue

    const fields: Record<string, string> = {}
    const regex = /<([^:>]+)(?::(\d+)(?::[^>]*)?)?>([^<]*)/g
    let match

    while ((match = regex.exec(record)) !== null) {
      const fieldName = match[1].trim()
      const value     = match[3].trim()
      if (fieldName && value) fields[fieldName] = value
    }

    if (!fields.CALL || !fields.QSO_DATE) continue

    qsos.push({
      call:       fields.CALL       ?? '',
      band:       fields.BAND       ?? '',
      mode:       fields.MODE       ?? '',
      qso_date:   fields.QSO_DATE   ?? '',
      time_on:    fields.TIME_ON    ?? '000000',
      rst_sent:   fields.RST_SENT   ?? '',
      rst_rcvd:   fields.RST_RCVD   ?? '',
      freq:       fields.FREQ       ?? '',
      sat_name:   fields.SAT_NAME   ?? '',
      dxcc:       fields.DXCC       ?? '',
      gridsquare: fields.GRIDSQUARE ?? '',
    })
  }

  return qsos
}

function adifDateToIso(date: string, time: string): string {
  const y  = date.slice(0, 4)
  const mo = date.slice(4, 6)
  const d  = date.slice(6, 8)
  const h  = time.slice(0, 2) || '00'
  const mi = time.slice(2, 4) || '00'
  const s  = time.slice(4, 6) || '00'
  return `${y}-${mo}-${d}T${h}:${mi}:${s}Z`
}

function normalizeBand(band: string): string {
  const b = band.toLowerCase().trim()
  const MAP: Record<string, string> = {
    '160m': '160m', '80m': '80m', '60m': '60m', '40m': '40m',
    '30m': '30m', '20m': '20m', '17m': '17m', '15m': '15m',
    '12m': '12m', '10m': '10m', '6m': '6m', '2m': '2m', '70cm': '70cm',
  }
  return MAP[b] ?? b
}

function normalizeMode(mode: string): string {
  const m = mode.toUpperCase().trim()
  const MAP: Record<string, string> = {
    'SSB': 'SSB', 'USB': 'SSB', 'LSB': 'SSB',
    'AM': 'AM', 'FM': 'FM', 'CW': 'CW',
    'FT8': 'FT8', 'FT4': 'FT4', 'JS8': 'JS8',
    'PHONE': 'SSB', 'PH': 'SSB',
  }
  return MAP[m] ?? m
}

// ============================================================
// TYPES
// ============================================================

interface ProposedActivation {
  date:        string
  qsos:        AdifQso[]
  locDesc:     string
  grid:        string
  confirmed:   boolean
}

type ImportStatus = 'idle' | 'parsing' | 'preview' | 'importing' | 'done' | 'error'

// ============================================================
// LIMITS
// ============================================================

const MAX_FILE_BYTES    = 10 * 1024 * 1024  // 10MB
const MAX_QSOS         = 10000
const MAX_ACTIVATIONS  = 500

// ============================================================
// COMPONENT
// ============================================================

export default function ImportPage() {
  const [status, setStatus]           = useState<ImportStatus>('idle')
  const [activations, setActivations] = useState<ProposedActivation[]>([])
  const [progress, setProgress]       = useState({ current: 0, total: 0 })
  const [errorMsg, setErrorMsg]       = useState('')
  const [callsign, setCallsign]       = useState('')
  const [userId, setUserId]           = useState<string | null>(null)
  const [doneCount, setDoneCount]     = useState(0)

  // Auth check on mount
  useState(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { window.location.href = '/login'; return }
      const uid = data.session.user.id
      const cs  = data.session.user.user_metadata?.callsign ?? ''
      setUserId(uid)
      setCallsign(cs)
    })
  })

  // ── File drop / select ──────────────────────────────────────

  const handleFile = useCallback((file: File) => {
    if (!file) return
    setStatus('parsing')
    setErrorMsg('')

    // Limit 1: file size (10MB) — checked before reading
    if (file.size > MAX_FILE_BYTES) {
      setStatus('error')
      setErrorMsg('File too large. Maximum size is 10MB. Please split your log into smaller files and import them one at a time.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const raw  = e.target?.result as string
        const qsos = parseAdif(raw)

        if (qsos.length === 0) {
          setStatus('error')
          setErrorMsg('No valid QSO records found in this file.')
          return
        }

        // Limit 2: QSO count (10,000)
        if (qsos.length > MAX_QSOS) {
          setStatus('error')
          setErrorMsg(`This file contains ${qsos.length.toLocaleString()} QSOs, which exceeds the 10,000 QSO limit per import. Please split your ADIF file into smaller chunks and import them one at a time.`)
          return
        }

        // Group by date
        const byDate: Record<string, AdifQso[]> = {}
        for (const q of qsos) {
          if (!byDate[q.qso_date]) byDate[q.qso_date] = []
          byDate[q.qso_date].push(q)
        }

        const proposed: ProposedActivation[] = Object.entries(byDate)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, qs]) => ({
            date:      `${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}`,
            qsos:      qs,
            locDesc:   '',
            grid:      qs[0]?.gridsquare?.slice(0, 6) ?? '',
            confirmed: true,
          }))

        // Limit 3: activation count (500)
        if (proposed.length > MAX_ACTIVATIONS) {
          setStatus('error')
          setErrorMsg(`This file contains ${proposed.length.toLocaleString()} activations (unique dates), which exceeds the 500 activation limit per import. Please split your ADIF file into smaller chunks and import them one at a time.`)
          return
        }

        setActivations(proposed)
        setStatus('preview')
      } catch (err: any) {
        setStatus('error')
        setErrorMsg(err.message ?? 'Failed to parse ADIF file.')
      }
    }
    reader.readAsText(file)
  }, [])

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  // ── Submit ──────────────────────────────────────────────────

  async function handleImport() {
    if (!userId) return

    const toImport = activations.filter(a => a.confirmed && a.locDesc.trim())
    if (toImport.length === 0) {
      setErrorMsg('Please add a location description to at least one activation.')
      return
    }

    setStatus('importing')
    setProgress({ current: 0, total: toImport.length })
    setErrorMsg('')

    let imported = 0

    for (const act of toImport) {
      try {
        const { data: actData, error: actError } = await supabase
          .from('activations')
          .insert({
            user_id:         userId,
            callsign:        callsign,
            activation_date: act.date,
            location_type:   'other',
            location_desc:   act.locDesc.trim(),
            grid_square:     act.grid.trim().toUpperCase() || null,
            qso_count:       act.qsos.length,
            confirmed_count: 0,
            is_successful:   act.qsos.length >= 1,
            submitted_at:    new Date().toISOString(),
            created_at:      new Date().toISOString(),
          })
          .select('id')
          .single()

        if (actError) throw actError

        const activationId = actData.id

        // Insert QSOs in batches of 500
        const BATCH = 500
        for (let i = 0; i < act.qsos.length; i += BATCH) {
          const batch = act.qsos.slice(i, i + BATCH)
          const rows  = batch.map(q => ({
            activation_id:  activationId,
            activator_call: callsign,
            chaser_call:    q.call,
            qso_datetime:   adifDateToIso(q.qso_date, q.time_on),
            band:           normalizeBand(q.band),
            frequency_khz:  q.freq ? parseFloat(q.freq) * 1000 : null,
            mode:           normalizeMode(q.mode),
            rst_sent:       q.rst_sent || null,
            rst_rcvd:       q.rst_rcvd || null,
            chaser_dxcc:    q.dxcc    || null,
            satellite_name: q.sat_name || null,
            is_a2a:         false,
            is_confirmed:   false,
          }))

          const { error: qsoError } = await supabase.from('qsos').insert(rows)
          if (qsoError) throw qsoError
        }

        imported++
        setProgress({ current: imported, total: toImport.length })
      } catch (err: any) {
        console.error('Import error on activation', act.date, err)
      }
    }

    setDoneCount(imported)
    setStatus('done')
  }

  // ── Render ──────────────────────────────────────────────────

  const inputStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: '0.5px solid var(--border)',
    color: 'var(--text)',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.8rem',
    padding: '0.5rem 0.75rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  }

  const totalQsos      = activations.reduce((s, a) => s + a.qsos.length, 0)
  const confirmedActs  = activations.filter(a => a.confirmed)
  const confirmedQsos  = confirmedActs.reduce((s, a) => s + a.qsos.length, 0)

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <Nav />

      <section style={{ padding: '5rem 2rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ display: 'inline-block', width: '2rem', height: '0.5px', background: 'var(--amber)' }} />
          Import Log
        </p>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, lineHeight: 1.1, color: 'var(--text)', marginBottom: '1rem' }}>
          Bring your log<br />
          <em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>into OOTA.</em>
        </h1>

        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', lineHeight: 1.8, color: 'var(--text-dim)', marginBottom: '2.5rem', maxWidth: '560px' }}>
          Upload an ADIF file exported from Log4OM, WSJT-X, or any logging software. QSOs will be grouped by date into activations. You'll review and confirm before anything is saved.
        </p>

        {/* ── DROP ZONE ── */}
        {(status === 'idle' || status === 'error') && (
          <div
            onDrop={onDrop}
            onDragOver={e => e.preventDefault()}
            style={{
              border: '1px dashed var(--border)',
              padding: '4rem 2rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
          >
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
              Drop your ADIF file here
            </p>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '1.5rem', opacity: 0.6 }}>
              .adi or .adif — max 10MB · 10,000 QSOs · 500 activations
            </p>
            <label style={{ cursor: 'pointer' }}>
              <input type="file" accept=".adi,.adif" onChange={onFileInput} style={{ display: 'none' }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--amber)', border: '0.5px solid var(--amber)', padding: '0.6rem 1.5rem', cursor: 'pointer' }}>
                Browse Files
              </span>
            </label>
            {status === 'error' && (
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: '#ff6b6b', marginTop: '1.5rem', maxWidth: '480px', margin: '1.5rem auto 0', lineHeight: 1.7 }}>{errorMsg}</p>
            )}
          </div>
        )}

        {/* ── PARSING ── */}
        {status === 'parsing' && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: 'var(--text-dim)', letterSpacing: '0.15em' }}>Parsing ADIF file…</p>
          </div>
        )}

        {/* ── PREVIEW ── */}
        {status === 'preview' && (
          <div>
            {/* Summary bar */}
            <div style={{ display: 'flex', gap: '2rem', padding: '1rem 1.25rem', background: 'rgba(201,168,76,0.06)', border: '0.5px solid rgba(201,168,76,0.2)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {[
                ['Activations found', activations.length],
                ['QSOs found', totalQsos.toLocaleString()],
                ['Selected to import', confirmedActs.length],
                ['QSOs to import', confirmedQsos.toLocaleString()],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 700, color: 'var(--amber)' }}>{value}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.58rem', color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</div>
                </div>
              ))}
            </div>

            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '1rem', lineHeight: 1.7 }}>
              Each date is a proposed activation. Add a location description for each one you want to import. Uncheck any you want to skip.
            </p>

            {errorMsg && (
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: '#ff6b6b', marginBottom: '1rem' }}>{errorMsg}</p>
            )}

            {/* Activation rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem', maxHeight: '60vh', overflowY: 'auto' }}>
              {activations.map((act, i) => (
                <div key={act.date} style={{
                  display: 'grid',
                  gridTemplateColumns: '24px 110px 60px 1fr 120px',
                  gap: '0.75rem',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  background: act.confirmed ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.01)',
                  border: `0.5px solid ${act.confirmed ? 'var(--border)' : '#1a1a1a'}`,
                  opacity: act.confirmed ? 1 : 0.4,
                }}>
                  <input type="checkbox" checked={act.confirmed}
                    onChange={e => {
                      const updated = [...activations]
                      updated[i] = { ...updated[i], confirmed: e.target.checked }
                      setActivations(updated)
                    }}
                    style={{ cursor: 'pointer', accentColor: 'var(--amber)' }}
                  />
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                    {act.date}
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: 'var(--amber)' }}>
                    {act.qsos.length} QSO{act.qsos.length !== 1 ? 's' : ''}
                  </span>
                  <input
                    type="text"
                    value={act.locDesc}
                    placeholder="Location description (required) *"
                    onChange={e => {
                      const updated = [...activations]
                      updated[i] = { ...updated[i], locDesc: e.target.value }
                      setActivations(updated)
                    }}
                    style={{ ...inputStyle, fontSize: '0.75rem' }}
                  />
                  <input
                    type="text"
                    value={act.grid}
                    placeholder="Grid (opt.)"
                    maxLength={6}
                    onChange={e => {
                      const updated = [...activations]
                      updated[i] = { ...updated[i], grid: e.target.value.toUpperCase() }
                      setActivations(updated)
                    }}
                    style={{ ...inputStyle, fontSize: '0.75rem', letterSpacing: '0.1em' }}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => { setStatus('idle'); setActivations([]) }}
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', background: 'transparent', border: '0.5px solid var(--border)', padding: '0.85rem 1.5rem', cursor: 'pointer' }}>
                Start Over
              </button>
              <button onClick={handleImport}
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0a0e14', background: 'var(--amber)', border: 'none', padding: '0.85rem 2rem', cursor: 'pointer', flex: 1 }}>
                Import {confirmedActs.length} Activation{confirmedActs.length !== 1 ? 's' : ''} ({confirmedQsos.toLocaleString()} QSOs)
              </button>
            </div>
          </div>
        )}

        {/* ── IMPORTING ── */}
        {status === 'importing' && (
          <div style={{ padding: '3rem 0' }}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '1.5rem', letterSpacing: '0.1em' }}>
              Importing {progress.current} of {progress.total} activations…
            </p>
            <div style={{ height: '3px', background: 'var(--border)', width: '100%' }}>
              <div style={{
                height: '100%',
                background: 'var(--amber)',
                width: `${progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0}%`,
                transition: 'width 0.3s ease',
              }} />
            </div>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', color: 'var(--text-dim)', marginTop: '0.75rem', opacity: 0.6 }}>
              Please keep this tab open.
            </p>
          </div>
        )}

        {/* ── DONE ── */}
        {status === 'done' && (
          <div style={{ border: '0.5px solid var(--amber)', padding: '2rem', textAlign: 'center' }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--amber)', marginBottom: '1rem' }}>
              Import complete.
            </p>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', lineHeight: 1.8, color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
              {doneCount} activation{doneCount !== 1 ? 's' : ''} imported successfully. 73, {callsign}.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/log" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'var(--amber)', color: '#0a0e14', padding: '0.75rem 1.5rem', textDecoration: 'none' }}>
                View the Log
              </a>
              <a href="/awards" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--amber)', textDecoration: 'none', border: '0.5px solid var(--amber)', padding: '0.75rem 1.5rem' }}>
                Check Awards
              </a>
              <a href="/import" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', textDecoration: 'none', border: '0.5px solid var(--border)', padding: '0.75rem 1.5rem' }}>
                Import Another
              </a>
            </div>
          </div>
        )}

      </section>

      <Footer />
    </main>
  )
}
