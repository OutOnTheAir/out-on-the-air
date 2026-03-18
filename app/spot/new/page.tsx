'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const LOCATION_TYPES = ['Field', 'Park', 'Summit', 'Beach', 'Rooftop', 'Mobile', 'Other']

type Status = 'idle' | 'submitting' | 'success' | 'error'

export default function SpotNewPage() {
  const [callsign, setCallsign]   = useState('')
  const [userId, setUserId]       = useState<string | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [status, setStatus]       = useState<Status>('idle')
  const [message, setMessage]     = useState('')

  const [date, setDate]           = useState(new Date().toISOString().split('T')[0])
  const [locType, setLocType]     = useState('Field')
  const [locDesc, setLocDesc]     = useState('')
  const [grid, setGrid]           = useState('')
  const [qsoCount, setQsoCount]   = useState('')
  const [notes, setNotes]         = useState('')

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

      // Upsert profile so it always exists with the correct Auth UID
      await supabase.from('profiles').upsert({
        id:           uid,
        callsign:     cs,
        display_name: cs,
        is_active:    true,
        created_at:   new Date().toISOString(),
      }, { onConflict: 'id' })

      // Upsert users table too
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

  async function handleSubmit() {
    if (!locDesc.trim()) { setStatus('error'); setMessage('Location description is required.'); return }
    if (!qsoCount || parseInt(qsoCount) < 1) { setStatus('error'); setMessage('QSO count must be at least 1.'); return }
    if (!userId) { setStatus('error'); setMessage('Session expired. Please log in again.'); return }

    setStatus('submitting')
    setMessage('')

    const { error } = await supabase.from('activations').insert({
      user_id:         userId,
      callsign:        callsign,
      activation_date: date,
      location_type:   locType.toLowerCase(),
      location_desc:   locDesc.trim(),
      grid_square:     grid.trim().toUpperCase() || null,
      qso_count:       parseInt(qsoCount),
      confirmed_count: 0,
      is_successful:   parseInt(qsoCount) >= 1,
      notes:           notes.trim() || null,
      submitted_at:    new Date().toISOString(),
      created_at:      new Date().toISOString(),
    })

    if (error) {
      setStatus('error')
      setMessage('Could not save activation. Please try again.')
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
          Voice and CW only. Any location except your home QTH. Minimum 1 QSO.
        </p>

        {status !== 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <div>
              <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem' }}>
                Activation Date <span style={{ color: 'var(--amber)' }}>*</span>
              </label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                disabled={status === 'submitting'}
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)', color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', padding: '0.85rem 1rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem' }}>
                Location Type <span style={{ color: 'var(--amber)' }}>*</span>
              </label>
              <select value={locType} onChange={e => setLocType(e.target.value)}
                disabled={status === 'submitting'}
                style={{ width: '100%', background: '#0a0e14', border: '0.5px solid var(--border)', color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', padding: '0.85rem 1rem', outline: 'none', boxSizing: 'border-box' }}
              >
                {LOCATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem' }}>
                Location Description <span style={{ color: 'var(--amber)' }}>*</span>
              </label>
              <input type="text" value={locDesc} onChange={e => setLocDesc(e.target.value)}
                placeholder="e.g. Waterfront Park — New Haven, CT"
                disabled={status === 'submitting'}
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)', color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', padding: '0.85rem 1rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem' }}>
                Grid Square <span style={{ opacity: 0.4 }}>(optional)</span>
              </label>
              <input type="text" value={grid} onChange={e => setGrid(e.target.value.toUpperCase())}
                placeholder="e.g. FN57" maxLength={6}
                disabled={status === 'submitting'}
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)', color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', letterSpacing: '0.15em', padding: '0.85rem 1rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem' }}>
                QSO Count <span style={{ color: 'var(--amber)' }}>*</span>
              </label>
              <input type="number" value={qsoCount} onChange={e => setQsoCount(e.target.value)}
                placeholder="0" min={1}
                disabled={status === 'submitting'}
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)', color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', padding: '0.85rem 1rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem' }}>
                Notes <span style={{ opacity: 0.4 }}>(optional)</span>
              </label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Conditions, antenna, anything worth noting…" rows={3}
                disabled={status === 'submitting'}
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)', color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', padding: '0.85rem 1rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
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
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', lineHeight: 1.8, color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
              73, {callsign}. It's in the record.
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
