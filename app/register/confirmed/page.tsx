import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default function ConfirmedPage() {
  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <Nav />

      <section style={{ padding: '5rem 2rem 2rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--amber)', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
        }}>
          <span style={{ display: 'inline-block', width: '2rem', height: '0.5px', background: 'var(--amber)' }} />
          Verified
          <span style={{ display: 'inline-block', width: '2rem', height: '0.5px', background: 'var(--amber)' }} />
        </p>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 700, lineHeight: 1.1,
          color: 'var(--text)', marginBottom: '1.5rem',
        }}>
          You're in.<br />
          <em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>Now get out there.</em>
        </h1>

        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.7rem', lineHeight: 1.8,
          color: 'var(--text-dim)', marginBottom: '2.5rem',
        }}>
          Your email has been confirmed and your OOTA account is active.
          Log your first activation and join the record.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/log" style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase',
            background: 'var(--amber)', color: '#0a0e14',
            padding: '0.75rem 1.5rem', textDecoration: 'none',
          }}>
            View the Log
          </a>
          <a href="/" style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--amber)', textDecoration: 'none',
            border: '0.5px solid var(--amber)',
            padding: '0.75rem 1.5rem',
          }}>
            Back to Home
          </a>
        </div>
      </section>

      <Footer />
    </main>
  )
}
