const items = [
  { tag: 'Inclusive', title: 'No barriers', body: 'No summits. No park lists. No hiking required. A parking lot, a pier, a rooftop — if you left home, you qualify.' },
  { tag: 'Human', title: 'Voice or fist', body: 'SSB, AM, FM simplex, or CW only. Every contact is a real person. No bots, no FT8, no computers talking to computers.' },
  { tag: 'Simple', title: 'One QSO', body: "One confirmed contact is a successful activation. We're not here to gatekeep. Just get out and make radio happen." },
  { tag: 'Global', title: '160 to 6 meters', body: 'The full HF spectrum plus 6 meters. Five watts and a wire in a tree. A kilowatt and a beam. It all counts.' },
]

export default function WhyOOTA() {
  return (
    <div style={{ background: 'var(--bg2)', padding: '4rem 2rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          marginBottom: '2rem', paddingBottom: '0.75rem',
          borderBottom: '0.5px solid var(--border-dim)',
        }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: 600 }}>Why OOTA?</div>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1px', background: 'var(--border-dim)',
          border: '0.5px solid var(--border-dim)',
        }}>
          {items.map((item, i) => (
            <div key={i} style={{ background: 'var(--bg2)', padding: '2rem 1.75rem' }}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.65rem', fontWeight: 500,
                letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'var(--amber)', marginBottom: '1rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <span style={{ display: 'block', width: '16px', height: '0.5px', background: 'var(--amber)' }} />
                {item.tag}
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.6rem' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.75, color: 'var(--text-dim)', fontWeight: 300 }}>
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
