export default function Footer() {
  return (
    <footer style={{
      padding: '1.5rem 2rem',
      borderTop: '0.5px solid var(--border-dim)',
      background: 'var(--bg)',
    }}>
      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
        Out On The Air — administered by WW1ZRD — outonttheair.com
      </p>
    </footer>
  )
}
