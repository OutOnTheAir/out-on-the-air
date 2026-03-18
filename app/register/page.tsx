'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

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

    if (!cs)                     { setStatus('error'); setMessage('Callsign is required.'); return }
    if (!em || !em.includes('@')) { setStatus('error'); setMessage('A valid email address is required.'); return }
    if (pw.length < 8)           { setStatus('error'); setMessage('Password must be at least 8 characters.'); return }

    setStatus('submitting')
    setMessage('')

    try {
      // Sign up — Supabase sends confirmation email automatically
      // We store callsign in user metadata so we can use it after confirmation
      const { error: authError } = await supabase.auth.signUp({
        email: em,
        password: pw,
        options: {
          emailRedirectTo: 'https://outontheair.com/register/confirmed',
          data: { callsign: cs },
        },
      })

      if (authError) throw authError

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

            <div>
              <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem' }}>
                Callsign <span style={{ color: 'var(--amber)' }}>*</span>
              </label>
              <input type="text" value={callsign}
                onChange={e => setCallsign(e.target.value.toUpperCase())}
                placeholder="W1AW" disabled={isLoading}
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)', color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', letterSpacing: '0.15em', padding: '0.85rem 1rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem' }}>
                Email Address <span style={{ color: 'var(--amber)' }}>*</span>
              </label>
              <input type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" disabled={isLoading}
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)', color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', padding: '0.85rem 1rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem' }}>
                Password <span style={{ color: 'var(--amber)' }}>*</span>
              </label>
              <input type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 8 characters" disabled={isLoading}
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)', color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', padding: '0.85rem 1rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {status === 'error' && (
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', lineHeight: 1.6, color: '#ff6b6b', border: '0.5px solid #ff6b6b', padding: '0.75rem 1rem' }}>
                {message}
              </p>
            )}

            <button onClick={handleSubmit} disabled={isLoading}
              style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', fontWeight: 500,
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

            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', color: 'var(--text-dim)', opacity: 0.5, lineHeight: 1.7 }}>
              OOTA operates on the honor system. Your email is used for account
              verification and notices only — never shared.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ border: '0.5px solid var(--amber)', padding: '2rem', textAlign: 'center' }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--amber)', marginBottom: '1rem' }}>
              Check your inbox.
            </p>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', lineHeight: 1.8, color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
              A confirmation link has been sent to <strong>{email}</strong>.
            </p>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', lineHeight: 1.8, color: 'var(--text-dim)' }}>
              Click the link to activate your account, then get out on the air.
            </p>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', lineHeight: 1.8, color: 'var(--text-dim)', opacity: 0.6, border: '0.5px solid var(--border)', padding: '0.75rem 1rem', marginTop: '1rem' }}>
              ⚠ The email comes from <strong>noreply@mail.app.supabase.io</strong> — not from OOTA directly. If you don't see it, check your spam or junk folder.
            </p>
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}
