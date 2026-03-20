export default function Footer() {
  return (
    <footer style={{
      padding: '1.5rem 2rem',
      borderTop: '0.5px solid var(--border-dim)',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '0.75rem',
    }}>
      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
        Out On The Air — administered by WW1ZRD — outontheair.com
      </p>
      <a href="/privacy" style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.62rem',
        color: 'var(--text-muted)',
        letterSpacing: '0.08em',
        textDecoration: 'none',
        opacity: 0.6,
      }}>
        Privacy Policy
      </a>
    </footer>
  )
}
