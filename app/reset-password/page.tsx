'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

type Status = 'idle' | 'submitting' | 'success' | 'error' | 'invalid'

export default function ResetPasswordPage() {
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [status, setStatus]       = useState<Status>('idle')
  const [message, setMessage]     = useState('')
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    // Supabase puts the access token in the URL hash after redirect
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSessionReady(true)
      } else {
        setStatus('invalid')
      }
    })
  }, [])

  async function handleSubmit() {
    const pw = password.trim()
    const cf = confirm.trim()

    if (!pw || pw.length < 8) {
      setStatus('error')
      setMessage('Password must be at least 8 characters.')
      return
    }
    if (pw !== cf) {
      setStatus('error')
      setMessage('Passwords do not match.')
      return
    }

    setStatus('submitting')
    setMessage('')

    const { error } = await supabase.auth.updateUser({ password: pw })

    if (error) {
      setStatus('error')
      setMessage('Could not update password. Your reset link may have expired — request a new one.')
      return
    }

    setStatus('success')
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
          New Password
        </p>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 700, lineHeight: 1.1,
          color: 'var(--text)', marginBottom: '2rem',
        }}>
          Set a new password.<br />
          <em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>Make it count.</em>
        </h1>

        {status === 'invalid' && (
          <div style={{ border: '0.5px solid #ff6b6b', padding: '2rem', textAlign: 'center' }}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', lineHeight: 1.8, color: '#ff6b6b', marginBottom: '1.5rem' }}>
              This reset link is invalid or has expired. Please request a new one.
            </p>
            <a href="/forgot-password" style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase',
              background: 'var(--amber)', color: '#0a0e14',
              padding: '0.75rem 1.5rem', textDecoration: 'none', display: 'inline-block',
            }}>
              Request New Link
            </a>
          </div>
        )}

        {status === 'success' && (
          <div style={{ border: '0.5px solid var(--amber)', padding: '2rem', textAlign: 'center' }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--amber)', marginBottom: '1rem' }}>
              Password updated.
            </p>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', lineHeight: 1.8, color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
              You're all set. Sign in with your new password.
            </p>
            <a href="/login" style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase',
              background: 'var(--amber)', color: '#0a0e14',
              padding: '0.75rem 1.5rem', textDecoration: 'none', display: 'inline-block',
            }}>
              Sign In
            </a>
          </div>
        )}

        {sessionReady && status !== 'success' && status !== 'invalid' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <div>
              <label style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem',
              }}>
                New Password <span style={{ color: 'var(--amber)' }}>*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                disabled={isLoading}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.03)',
                  border: '0.5px solid var(--border)', color: 'var(--text)',
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem',
                  padding: '0.85rem 1rem', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem',
              }}>
                Confirm Password <span style={{ color: 'var(--amber)' }}>*</span>
              </label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat your new password"
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
              {isLoading ? 'Updating…' : 'Update Password'}
            </button>

          </div>
        )}

      </section>

      <Footer />
    </main>
  )
}
