'use client'
import Link from 'next/link'

export default function Nav() {
  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '1.25rem 2rem',
      borderBottom: '0.5px solid var(--border)',
      background: 'rgba(10,14,20,0.97)',
      position: 'sticky', top: 0, zIndex: 100,
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 600, color: 'var(--amber)' }}>
        Out On The Air
        <span style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--text-dim)', fontSize: '0.85rem', marginLeft: '8px' }}>/ OOTA</span>
      </div>
      <div style={{ display: 'flex', gap: '2rem' }}>
        {['Spots', 'Log', 'Awards', 'About'].map(item => (
          <Link key={item} href={`/${item.toLowerCase()}`} style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.7rem', fontWeight: 500,
            color: 'var(--text-dim)', textDecoration: 'none',
            letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            {item}
          </Link>
        ))}
      </div>
      <Link href="/register" style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.7rem', fontWeight: 500,
        border: '0.5px solid var(--amber)',
        color: 'var(--amber)',
        padding: '0.5rem 1.25rem',
        letterSpacing: '0.1em', textTransform: 'uppercase',
        textDecoration: 'none',
      }}>
        Get Started
      </Link>
    </nav>
  )
}
