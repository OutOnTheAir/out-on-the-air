const stats = [
  { num: '0', label: 'Activations' },
  { num: '0', label: 'QSOs Logged' },
  { num: '0', label: 'DXCC Entities' },
  { num: '0', label: 'Operators' },
  { num: '0', label: 'On Air Now' },
]

export default function StatsBar() {
  return (
    <div style={{
      display: 'flex', justifyContent: 'center',
      borderTop: '0.5px solid var(--border)',
      borderBottom: '0.5px solid var(--border)',
      background: 'var(--bg2)',
    }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          flex: 1, maxWidth: '200px',
          padding: '1.25rem 1.5rem', textAlign: 'center',
          borderRight: i < stats.length - 1 ? '0.5px solid var(--border-dim)' : 'none',
        }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '1.5rem', fontWeight: 500,
            color: 'var(--amber)', display: 'block',
          }}>{s.num}</span>
          <span style={{
            fontSize: '0.7rem', fontWeight: 400,
            color: 'var(--text-muted)',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            marginTop: '0.2rem', display: 'block',
          }}>{s.label}</span>
        </div>
      ))}
    </div>
  )
}
