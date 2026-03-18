'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const BANDS = ['160m', '80m', '60m', '40m', '30m', '20m', '17m', '15m', '12m', '10m', '6m']
const MODES = ['SSB', 'AM', 'FM', 'CW']
const LOCATION_TYPES = ['Park', 'Beach', 'Rooftop', 'Rural', 'Vehicle', 'Vessel', 'Other']

type Status = 'idle' | 'submitting' | 'success' | 'error'

export default function SpotPostPage() {
  const [callsign, setCallsign]   = useState('')
  const [userId, setUserId]       = useState<string | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [status, setStatus]       = useState<Status>('idle')
  const [message, setMessage]     = useState('')

  const [frequency, setFrequency] = useState('')
  const [band, setBand]           = useState('40m')
  const [mode, setMode]           = useState('SSB')
  const [locType, setLocType]     = useState('Park')
  const [locDesc, setLocDesc]     = useState('')
  const [comment, setComment]     = useState('')

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

      // Upsert profile
      await supabase.from('profiles').upsert({
        id: uid, callsign: cs, display_name: cs,
        is_active: true, created_at: new Date().toISOString(),
      }, { onConflict: 'id' })

      setAuthReady(true)
    })
  }, [])

  async function handleSubmit() {
    const freqNum = parseFloat(frequency)
    if (!frequency || isNaN(freqNum) || freqNum <= 0) {
      setStatus('error'); setMessage('A valid frequency is required.'); return
    }
    if (!locDesc.trim()) {
      setStatus('error'); setMessage('Location description is required.'); return
    }
    if (!userId) {
      setStatus('error'); setMessage('Session expired. Please log in again.'); return
    }

    setStatus('submitting')
    setMessage('')

    const now = new Date()
    const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours

    const { error } = await supabase.from('spots').insert({
      user_id:       userId,
      callsign:      callsign,
      frequency_khz: Math.round(freqNum * 1000),
      band:          band,
      mode:          mode,
      location_type: locType.toLowerCase(),
      location_desc: locDesc.trim(),
      comment:       comment.trim() || null,
      posted_at:     now.toISOString(),
      expires_at:    expiresAt.toISOString(),
      is_active:     true,
    })

    if (error) {
      setStatus('error')
      setMessage('Could not post spot. Please try again.')
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
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--text-dim)' }}>Checking session…</p>
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
          Post a Spot
        </p>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 700, lineHeight: 1.1,
          color: 'var(--text)', marginBottom: '1rem',
        }}>
          You're on the air.<br />
          <em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>Let them find you.</em>
        </h1>

        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', lineHeight: 1.8, color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
          Spotting as <strong style={{ color: 'var(--amber)' }}>{callsign}</strong>
        </p>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', lineHeight: 1.8, color: 'var(--text-dim)', marginBottom: '2.5rem' }}>
          Spot stays active for <strong>2 hours</strong> · Voice and CW only · Self-spotting encouraged
        </p>

        {status !== 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Frequency */}
            <div>
              <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem' }}>
                Frequency (MHz) <span style={{ color: 'var(--amber)' }}>*</span>
              </label>
              <input type="number" value={frequency} onChange={e => setFrequency(e.target.value)}
                placeholder="e.g. 14.255" step="0.001"
                disabled={status === 'submitting'}
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)', color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace", fontSize: '1rem', letterSpacing: '0.1em', padding: '0.85rem 1rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Band + Mode row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem' }}>
                  Band <span style={{ color: 'var(--amber)' }}>*</span>
                </label>
                <select value={band} onChange={e => setBand(e.target.value)}
                  disabled={status === 'submitting'}
                  style={{ width: '100%', background: '#0a0e14', border: '0.5px solid var(--border)', color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', padding: '0.85rem 1rem', outline: 'none', boxSizing: 'border-box' }}
                >
                  {BANDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem' }}>
                  Mode <span style={{ color: 'var(--amber)' }}>*</span>
                </label>
                <select value={mode} onChange={e => setMode(e.target.value)}
                  disabled={status === 'submitting'}
                  style={{ width: '100%', background: '#0a0e14', border: '0.5px solid var(--border)', color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', padding: '0.85rem 1rem', outline: 'none', boxSizing: 'border-box' }}
                >
                  {MODES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            {/* Location Type */}
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

            {/* Location Description */}
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

            {/* Comment */}
            <div>
              <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem' }}>
                Comment <span style={{ opacity: 0.4 }}>(optional)</span>
              </label>
              <input type="text" value={comment} onChange={e => setComment(e.target.value)}
                placeholder="e.g. Calling CQ, 100W, dipole"
                disabled={status === 'submitting'}
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)', color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', padding: '0.85rem 1rem', outline: 'none', boxSizing: 'border-box' }}
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
              {status === 'submitting' ? 'Posting…' : 'Post Spot'}
            </button>
          </div>
        )}

        {status === 'success' && (
          <div style={{ border: '0.5px solid var(--amber)', padding: '2rem', textAlign: 'center' }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--amber)', marginBottom: '1rem' }}>
              You're spotted.
            </p>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', lineHeight: 1.8, color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
              {callsign} is live on the board. Spot expires in 2 hours.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/spots" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'var(--amber)', color: '#0a0e14', padding: '0.75rem 1.5rem', textDecoration: 'none' }}>
                View Spots
              </a>
              <a href="/spot/new" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--amber)', textDecoration: 'none', border: '0.5px solid var(--amber)', padding: '0.75rem 1.5rem' }}>
                Log Activation
              </a>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}
