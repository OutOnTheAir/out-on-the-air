'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Status = 'idle' | 'submitting' | 'success' | 'error'

export default function RegisterPage() {
  const [callsign, setCallsign] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus]     = useState<Status>('idle')
  const [message, setMessage]   = useState('')

  async function handleSubmit() {
    const cs = callsign.trim().toUpperCase()
    const em = email.trim().toLowerCase()
    const pw = password.trim()

    if (!cs)                    { setStatus('error'); setMessage('Callsign is required.'); return }
    if (!em || !em.includes('@')){ setStatus('error'); setMessage('A valid email address is required.'); return }
    if (pw.length < 8)          { setStatus('error'); setMessage('Password must be at least 8 characters.'); return }

    setStatus('submitting')
    setMessage('')

    try {
      // 1. Check for duplicate callsign
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

      // 2. Sign up via Supabase Auth — sends confirmation email automatically
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: em,
        password: pw,
        options: {
          emailRedirectTo: 'https://outontheair.com/register/confirmed',
          data: { callsign: cs },
        },
      })

      if (authError) throw authError

      // 3. Write to users table
      await supabase.from('users').insert({
        id:           authData.user?.id,
        callsign:     cs,
        email:        em,
        display_name: cs,
        is_active:    false, // becomes true after email confirmation
        created_at:   new Date().toISOString(),
      })

      // 4. Write to profiles table
      await supabase.from('profiles').insert({
        id:           authData.user?.id,
        callsign:     cs,
        display_name: cs,
        is_active:    false,
        created_at:   new Date().toISOString(),
      })

      setStatus('success')

    } catch (err: any) {
      setStatus('error')
      setMessage(err.message ?? 'Something went wrong. Please try again.')
      console.error(err)
    }
  }

  const isLoading = status === 'submitting'

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
          Register with your callsign and email. You'll receive a confirmation
          link — click it to activate your account. Honor system.
        </p>

        {status !== 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Callsign */}
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
                  width: '100%', background: 'rgba(255,255,255,0.03)',
                  border: '0.5px solid var(--border)', color: 'var(--text)',
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem',
                  letterSpacing: '0.15em', padding: '0.85rem 1rem',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Email */}
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
                  width: '100%', background: 'rgba(255,255,255,0.03)',
                  border: '0.5px solid var(--border)', color: 'var(--text)',
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem',
                  padding: '0.85rem 1rem', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem',
              }}>
                Password <span style={{ color: 'var(--amber)' }}>*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                disabled={isLoading}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.03)',
                  border: '0.5px solid var(--border)', color: 'var(--text)',
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem',
                  padding: '0.85rem 1rem', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Error */}
            {status === 'error' && (
              <p style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.68rem', lineHeight: 1.6, color: '#ff6b6b',
                border: '0.5px solid #ff6b6b', padding: '0.75rem 1rem',
              }}>
                {message}
              </p>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.7rem', fontWeight: 500,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                background: isLoading ? 'rgba(255,255,255,0.1)' : 'var(--amber)',
                color: isLoading ? 'var(--text-dim)' : '#0a0e14',
                border: 'none', padding: '1rem 2rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                width: '100%', transition: 'opacity 0.2s',
              }}
            >
              {isLoading ? 'Creating account…' : 'Register'}
            </button>

            <p style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.6rem', color: 'var(--text-dim)', opacity: 0.5, lineHeight: 1.7,
            }}>
              OOTA operates on the honor system. Your email is used for account
              verification and notices only — never shared.
            </p>
          </div>
        )}

        {/* Pending verification */}
        {status === 'success' && (
          <div style={{ border: '0.5px solid var(--amber)', padding: '2rem', textAlign: 'center' }}>
            <p style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.5rem', fontWeight: 700,
              color: 'var(--amber)', marginBottom: '1rem',
            }}>
              Check your inbox.
            </p>
            <p style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.7rem', lineHeight: 1.8,
              color: 'var(--text-dim)', marginBottom: '0.5rem',
            }}>
              A confirmation link has been sent to <strong>{email}</strong>.
            </p>
            <p style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.7rem', lineHeight: 1.8,
              color: 'var(--text-dim)',
            }}>
              Click the link to activate your account, then get out on the air.
            </p>
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}
