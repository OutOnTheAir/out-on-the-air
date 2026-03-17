export default function TaglineStrip() {
  return (
    <div style={{ padding: '3rem 2rem', textAlign: 'center', borderTop: '0.5px solid var(--border)' }}>
      <p style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
        fontStyle: 'italic', fontWeight: 400,
        color: 'var(--text-dim)', maxWidth: '600px',
        margin: '0 auto 2rem', lineHeight: 1.5,
      }}>
        <em style={{ color: 'var(--amber)', fontStyle: 'normal' }}>Your voice or your fist.</em>
        <br />Nothing in between.
      </p>
      <a href="/register" style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.72rem', fontWeight: 500,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        background: 'var(--amber)', color: 'var(--bg)',
        padding: '0.9rem 2rem', textDecoration: 'none',
        display: 'inline-block',
      }}>
        Join OOTA — It&apos;s Free
      </a>
    </div>
  )
}
