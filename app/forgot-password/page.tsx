'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

type Status = 'idle' | 'submitting' | 'sent' | 'error'

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit() {
    const em = email.trim().toLowerCase()
    if (!em || !em.includes('@')) {
      setStatus('error')
      setMessage('A valid email address is required.')
      return
    }

    setStatus('submitting')
    setMessage('')

    const { error } = await supabase.auth.resetPasswordForEmail(em, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
      return
    }

    setStatus('sent')
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
          Reset Password
        </p>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 700, lineHeight: 1.1,
          color: 'var(--text)', marginBottom: '1rem',
        }}>
          Forgot your password?<br />
          <em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>No problem.</em>
        </h1>

        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.7rem', lineHeight: 1.8,
          color: 'var(--text-dim)', marginBottom: '3rem',
        }}>
          Enter the email address on your account and we'll send you a reset link.
          Back to <a href="/login" style={{ color: 'var(--amber)', textDecoration: 'none' }}>Sign In</a>.
        </p>

        {status !== 'sent' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

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
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.03)',
                  border: '0.5px solid var(--border)', color: 'var(--text)',
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem',
                  padding: '0.85rem 1rem', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {status === 'error' && (
              <p style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.68rem', lineHeight: 1.6, color: '#ff6b6b',
                border: '0.5px solid #ff6b6b', padding: '0.75rem 1rem',
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
                border: 'none', padding: '1rem 2rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                width: '100%', transition: 'opacity 0.2s',
              }}
            >
              {isLoading ? 'Sending…' : 'Send Reset Link'}
            </button>

          </div>
        ) : (
          <div style={{ border: '0.5px solid var(--amber)', padding: '2rem', textAlign: 'center' }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--amber)', marginBottom: '1rem' }}>
              Check your inbox.
            </p>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', lineHeight: 1.8, color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
              If an account exists for <strong style={{ color: 'var(--text)' }}>{email}</strong>, a reset link is on its way. Check your spam folder if you don't see it within a few minutes.
            </p>
            <a href="/login" style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--amber)', textDecoration: 'none',
              border: '0.5px solid var(--amber)', padding: '0.75rem 1.5rem',
              display: 'inline-block',
            }}>
              Back to Sign In
            </a>
          </div>
        )}

      </section>

      <Footer />
    </main>
  )
}
