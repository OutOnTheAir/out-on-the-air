'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Status = 'idle' | 'submitting' | 'error'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus]     = useState<Status>('idle')
  const [message, setMessage]   = useState('')

  async function handleSubmit() {
    const em = email.trim().toLowerCase()
    const pw = password.trim()

    if (!em || !em.includes('@')) { setStatus('error'); setMessage('A valid email address is required.'); return }
    if (!pw)                       { setStatus('error'); setMessage('Password is required.'); return }

    setStatus('submitting')
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({ email: em, password: pw })

    if (error) {
      setStatus('error')
      setMessage('Incorrect email or password. Please try again.')
      return
    }

    window.location.href = '/spots'
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
          Sign In
        </p>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 700, lineHeight: 1.1,
          color: 'var(--text)', marginBottom: '1rem',
        }}>
          Welcome back.<br />
          <em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>Good to hear you.</em>
        </h1>

        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.7rem', lineHeight: 1.8,
          color: 'var(--text-dim)', marginBottom: '3rem',
        }}>
          Sign in to your OOTA account.
          Not registered yet? <a href="/register" style={{ color: 'var(--amber)', textDecoration: 'none' }}>Create an account</a>.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
              <label style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'var(--text-dim)',
              }}>
                Password <span style={{ color: 'var(--amber)' }}>*</span>
              </label>
              <a href="/forgot-password" style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.58rem', color: 'var(--text-dim)',
                textDecoration: 'none', opacity: 0.6,
              }}>
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your password"
              disabled={isLoading}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
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
            {isLoading ? 'Signing in…' : 'Sign In'}
          </button>

        </div>
      </section>

      <Footer />
    </main>
  )
}
