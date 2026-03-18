'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Status = 'idle' | 'verifying' | 'success' | 'error'

export default function RegisterPage() {
  const [callsign, setCallsign] = useState('')
  const [email, setEmail]       = useState('')
  const [status, setStatus]     = useState<Status>('idle')
  const [message, setMessage]   = useState('')

  async function handleSubmit() {
    const cs = callsign.trim().toUpperCase()
    const em = email.trim().toLowerCase()

    if (!cs) { setStatus('error'); setMessage('Callsign is required.'); return }
    if (!em || !em.includes('@')) { setStatus('error'); setMessage('A valid email address is required.'); return }

    setStatus('verifying')
    setMessage('')

    try {
      // 1. FCC verification via our API route
      const fccRes = await fetch(`/api/verify-callsign?callsign=${cs}`)
      const fccData = await fccRes.json()

      if (!fccData.valid) {
        setStatus('error')
        setMessage(`${cs} was not found as an active amateur radio license in the FCC database. Please check your callsign and try again.`)
        return
      }

      // 2. Duplicate check
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('callsign', cs)
        .maybeSingle()

      if (existing) {
        setStatus('error')
        setMessage(`${cs} is already registered. If this is your callsign, please contact us.`)
        return
      }

      // 3. Insert into users
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          callsign:     cs,
          email:        em,
          display_name: cs,
          is_active:    true,
          created_at:   new Date().toISOString(),
        })

      if (insertError) throw insertError

      // 4. Insert into profiles
      await supabase
        .from('profiles')
        .insert({
          callsign:     cs,
          display_name: cs,
          is_active:    true,
          created_at:   new Date().toISOString(),
        })

      setStatus('success')
      setMessage(`Welcome to OOTA, ${cs}. Your callsign has been verified and your account is active. Get out there.`)

    } catch (err: any) {
      setStatus('error')
      setMessage('Something went wrong. Please try again in a moment.')
      console.error(err)
    }
  }

  const isLoading = status === 'verifying'

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
          Get Started
        </p>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 700, lineHeight: 1.1,
          color: 'var(--text)', marginBottom: '1rem',
        }}>
          Join OOTA.<br />
          <em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>Get out on the air.</em>
        </h1>

        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.7rem', lineHeight: 1.8,
          color: 'var(--text-dim)', marginBottom: '3rem',
        }}>
          Registration requires a valid FCC amateur radio license.
          Your callsign will be verified against the FCC database before your account is created.
        </p>

        {status !== 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <div>
              <label style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem',
              }}>
                Callsign <span style={{ color: 'var(--amber)' }}>*</span>
              </label>
              <input
                type="text"
                value={callsign}
                onChange={e => setCallsign(e.target.value.toUpperCase())}
                placeholder="W1AW"
                disabled={isLoading}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '0.5px solid var(--border)',
                  color: 'var(--text)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '1.1rem',
                  letterSpacing: '0.15em',
                  padding: '0.85rem 1rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem',
              }}>
                Email Address <span style={{ color: 'var(--amber)' }}>*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={isLoading}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '0.5px solid var(--border)',
                  color: 'var(--text)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.85rem',
                  padding: '0.85rem 1rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {status === 'error' && (
              <p style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.68rem', lineHeight: 1.6,
                color: '#ff6b6b',
                border: '0.5px solid #ff6b6b',
                padding: '0.75rem 1rem',
              }}>
                {message}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.7rem', fontWeight: 500,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                background: isLoading ? 'rgba(255,255,255,0.1)' : 'var(--amber)',
                color: isLoading ? 'var(--text-dim)' : '#0a0e14',
                border: 'none',
                padding: '1rem 2rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                width: '100%',
                transition: 'opacity 0.2s',
              }}
            >
              {isLoading ? 'Verifying with FCC…' : 'Verify & Register'}
            </button>

            <p style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.6rem', color: 'var(--text-dim)', opacity: 0.5,
              lineHeight: 1.7,
            }}>
              Your callsign is verified against the FCC ULS database.
              Only active amateur licenses are accepted.
              Your email is used for account notices only — never shared.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div style={{
            border: '0.5px solid var(--amber)',
            padding: '2rem',
            textAlign: 'center',
          }}>
            <p style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.5rem', fontWeight: 700,
              color: 'var(--amber)', marginBottom: '1rem',
            }}>
              73, {callsign}.
            </p>
            <p style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.7rem', lineHeight: 1.8,
              color: 'var(--text-dim)', marginBottom: '1.5rem',
            }}>
              {message}
            </p>
            <a href="/log" style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--amber)', textDecoration: 'none',
              border: '0.5px solid var(--amber)',
              padding: '0.75rem 1.5rem',
              display: 'inline-block',
            }}>
              View the Log →
            </a>
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}
