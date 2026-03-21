'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Nav() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('oota-theme') as 'dark' | 'light' | null
    if (saved) {
      setTheme(saved)
      document.documentElement.setAttribute('data-theme', saved)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('oota-theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const linkStyle = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.7rem', fontWeight: 500,
    color: 'var(--text-dim)', textDecoration: 'none',
    letterSpacing: '0.1em', textTransform: 'uppercase' as const,
  }

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '1.25rem 2rem',
      borderBottom: '0.5px solid var(--border)',
      background: theme === 'dark' ? 'rgba(10,14,20,0.97)' : 'rgba(245,240,232,0.97)',
      position: 'sticky', top: 0, zIndex: 100,
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 600, color: 'var(--amber)' }}>
        Out On The Air
        <span style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--text-dim)', fontSize: '0.85rem', marginLeft: '8px' }}>/ OOTA</span>
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        {([
          ['Home', '/'],
          ['About', '/about'],
          ['Spots', '/spots'],
          ['Log', '/log'],
          ['Awards', '/awards'],
          ['Leaderboard', '/leaderboard'],
          ['Import', '/import'],
          ['Blog', '/blog'],
          ['Contact', 'mailto:outontheair@outlook.com'],
        ] as [string, string][]).map(([label, href]) => (
          <Link key={label} href={href} style={linkStyle}>
            {label}
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            background: 'none', border: '0.5px solid var(--border-dim)',
            color: 'var(--text-dim)', cursor: 'pointer',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.65rem', padding: '0.35rem 0.75rem',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
          {theme === 'dark' ? '☀ Light' : '☾ Dark'}
        </button>

        {loggedIn ? (
          <>
            <Link href="/profile" style={linkStyle}>Profile</Link>
            <Link href="/spot/new" style={{
              ...linkStyle,
              border: '0.5px solid var(--amber)',
              color: 'var(--amber)',
              padding: '0.5rem 1.25rem',
            }}>
              Log Activation
            </Link>
            <button onClick={handleSignOut} style={{
              ...linkStyle,
              background: 'none', border: 'none',
              cursor: 'pointer', padding: '0.5rem 0',
            }}>
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" style={linkStyle}>Sign In</Link>
            <Link href="/register" style={{
              ...linkStyle,
              border: '0.5px solid var(--amber)',
              color: 'var(--amber)',
              padding: '0.5rem 1.25rem',
            }}>
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
