'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

type Status = 'idle' | 'saving' | 'success' | 'error'

export default function ProfilePage() {
  const [authReady, setAuthReady] = useState(false)
  const [userId, setUserId]       = useState<string | null>(null)
  const [status, setStatus]       = useState<Status>('idle')
  const [message, setMessage]     = useState('')

  // Fields
  const [callsign, setCallsign]       = useState('')
  const [displayName, setDisplayName] = useState('')
  const [country, setCountry]         = useState('')
  const [dxccCode, setDxccCode]       = useState('')
  const [gridSquare, setGridSquare]   = useState('')
  const [bio, setBio]                 = useState('')
  const [avatarUrl, setAvatarUrl]     = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        window.location.href = '/login'
        return
      }

      const uid = data.session.user.id
      setUserId(uid)

      // Load existing profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle()

      if (profile) {
        setCallsign(profile.callsign ?? '')
        setDisplayName(profile.display_name ?? '')
        setCountry(profile.country ?? '')
        setDxccCode(profile.dxcc_code ?? '')
        setGridSquare(profile.grid_square ?? '')
        setBio(profile.bio ?? '')
        setAvatarUrl(profile.avatar_url ?? '')
      } else {
        // Fall back to auth metadata
        const meta = data.session.user.user_metadata
        setCallsign(meta?.callsign ?? '')
        setDisplayName(meta?.callsign ?? '')
      }

      setAuthReady(true)
    })
  }, [])

  async function handleSave() {
    if (!callsign.trim()) { setStatus('error'); setMessage('Callsign is required.'); return }
    if (!userId) { setStatus('error'); setMessage('Session expired. Please log in again.'); return }

    setStatus('saving')
    setMessage('')

    const cs = callsign.trim().toUpperCase()

    // Update profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        callsign:     cs,
        display_name: displayName.trim() || cs,
        country:      country.trim() || null,
        dxcc_code:    dxccCode.trim().toUpperCase() || null,
        grid_square:  gridSquare.trim().toUpperCase() || null,
        bio:          bio.trim() || null,
        avatar_url:   avatarUrl.trim() || null,
      })
      .eq('id', userId)

    if (profileError) {
      setStatus('error')
      setMessage('Could not save profile. Please try again.')
      console.error(profileError)
      return
    }

    // Update users table too
    await supabase
      .from('users')
      .update({
        callsign:     cs,
        display_name: displayName.trim() || cs,
        country:      country.trim() || null,
        dxcc_code:    dxccCode.trim().toUpperCase() || null,
        grid_square:  gridSquare.trim().toUpperCase() || null,
      })
      .eq('id', userId)

    setCallsign(cs)
    setStatus('success')
    setMessage('Profile saved.')

    setTimeout(() => {
      setStatus('idle')
      setMessage('')
    }, 3000)
  }

  if (!authReady) {
    return (
      <main style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
        <Nav />
        <section style={{ padding: '8rem 2rem', textAlign: 'center' }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--text-dim)' }}>Loading profile…</p>
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
          Your Profile
        </p>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 700, lineHeight: 1.1,
          color: 'var(--text)', marginBottom: '2.5rem',
        }}>
          {callsign || 'Your callsign'}<br />
          <em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>on the record.</em>
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Callsign */}
          <div>
            <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem' }}>
              Callsign <span style={{ color: 'var(--amber)' }}>*</span>
            </label>
            <input type="text" value={callsign}
              onChange={e => setCallsign(e.target.value.toUpperCase())}
              placeholder="W1AW"
              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)', color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', letterSpacing: '0.15em', padding: '0.85rem 1rem', outline: 'none', boxSizing: 'border-box' }}
            />
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.58rem', color: 'var(--text-dim)', opacity: 0.5, marginTop: '0.4rem' }}>
              Update if you've received a vanity or upgraded your license class.
            </p>
          </div>

          {/* Display Name */}
          <div>
            <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem' }}>
              Display Name
            </label>
            <input type="text" value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="How you appear on the log"
              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)', color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', padding: '0.85rem 1rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Country + DXCC row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem' }}>
                Country
              </label>
              <input type="text" value={country}
                onChange={e => setCountry(e.target.value)}
                placeholder="United States"
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)', color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', padding: '0.85rem 1rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem' }}>
                DXCC Code
              </label>
              <input type="text" value={dxccCode}
                onChange={e => setDxccCode(e.target.value.toUpperCase())}
                placeholder="K"
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)', color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', letterSpacing: '0.15em', padding: '0.85rem 1rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Grid Square */}
          <div>
            <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem' }}>
              Home Grid Square
            </label>
            <input type="text" value={gridSquare}
              onChange={e => setGridSquare(e.target.value.toUpperCase())}
              placeholder="FN57" maxLength={6}
              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)', color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', letterSpacing: '0.15em', padding: '0.85rem 1rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Bio */}
          <div>
            <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem' }}>
              Bio <span style={{ opacity: 0.4 }}>(optional)</span>
            </label>
            <textarea value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="A few words about yourself and your operating style…"
              rows={3}
              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)', color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', padding: '0.85rem 1rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
            />
          </div>

          {/* Avatar URL */}
          <div>
            <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem' }}>
              Avatar URL <span style={{ opacity: 0.4 }}>(optional)</span>
            </label>
            <input type="url" value={avatarUrl}
              onChange={e => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)', color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', padding: '0.85rem 1rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Error */}
          {status === 'error' && (
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', lineHeight: 1.6, color: '#ff6b6b', border: '0.5px solid #ff6b6b', padding: '0.75rem 1rem' }}>
              {message}
            </p>
          )}

          {/* Success */}
          {status === 'success' && (
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', lineHeight: 1.6, color: 'var(--amber)', border: '0.5px solid var(--amber)', padding: '0.75rem 1rem' }}>
              ✓ {message}
            </p>
          )}

          {/* Save */}
          <button onClick={handleSave} disabled={status === 'saving'}
            style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', fontWeight: 500,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              background: status === 'saving' ? 'rgba(255,255,255,0.1)' : 'var(--amber)',
              color: status === 'saving' ? 'var(--text-dim)' : '#0a0e14',
              border: 'none', padding: '1rem 2rem',
              cursor: status === 'saving' ? 'not-allowed' : 'pointer',
              width: '100%', transition: 'opacity 0.2s',
            }}
          >
            {status === 'saving' ? 'Saving…' : 'Save Profile'}
          </button>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a href="/log" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: 'var(--text-dim)', textDecoration: 'none', opacity: 0.6 }}>
              View Log →
            </a>
            <a href="/spot/new" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: 'var(--text-dim)', textDecoration: 'none', opacity: 0.6 }}>
              Log Activation →
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
