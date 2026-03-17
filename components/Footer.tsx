export default function Footer() {
  return (
    <footer style={{
      padding: '1.5rem 2rem',
      borderTop: '0.5px solid var(--border-dim)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'var(--bg)',
    }}>
      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
        Out On The Air — administered by WW1ZRD — outonttheair.com
      </p>
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {[['Rules', '/about'], ['About', '/about'], ['Contact', '/contact']].map(([label, href]) => (
          <a key={label} href={href} style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.62rem', color: 'var(--text-muted)',
            textDecoration: 'none', letterSpacing: '0.08em',
          }}>{label}</a>
        ))}
      </div>
    </footer>
  )
}
