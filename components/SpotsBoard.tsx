'use client'
const MOCK_SPOTS = [
  { call: 'W1AW', freq: '14.255', band: '20m', mode: 'SSB', loc: 'Waterfront park — New Haven, CT', age: '8 min ago' },
  { call: 'VE3KGB', freq: '7.032', band: '40m', mode: 'CW', loc: 'Rooftop — Toronto, ON', age: '14 min ago' },
  { call: 'KD9ZZR', freq: '28.450', band: '10m', mode: 'SSB', loc: 'Parking lot — Indianapolis, IN', age: '31 min ago' },
  { call: 'G4RZT', freq: '3.755', band: '80m', mode: 'SSB', loc: 'Rural field — Devon, England', age: '47 min ago' },
  { call: 'JA1XYZ', freq: '1.835', band: '160m', mode: 'CW', loc: 'Rooftop — Tokyo, Japan', age: '1 hr ago' },
]

export default function SpotsBoard() {
  return (
    <section id="spots" style={{ padding: '4rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: '1.5rem', paddingBottom: '0.75rem',
        borderBottom: '0.5px solid var(--border-dim)',
      }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: 600 }}>
          <span className="pulse-dot" style={{
            display: 'inline-block', width: '6px', height: '6px',
            borderRadius: '50%', background: 'var(--green)', marginRight: '8px',
            verticalAlign: 'middle',
          }} />
          Live Spots
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
          Updates every 60 seconds — self-spotting encouraged
        </div>
      </div>

      {MOCK_SPOTS.map((spot, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: 'auto 1fr auto',
          gap: '1rem', alignItems: 'center',
          padding: '1rem 1.25rem',
          background: 'var(--bg2)',
          border: '0.5px solid var(--border-dim)',
          marginBottom: '0.5rem',
        }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '1rem', fontWeight: 500,
            color: 'var(--amber)', minWidth: '90px',
          }}>{spot.call}</div>

          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: 'var(--text)', marginBottom: '0.2rem' }}>
              {spot.freq} MHz — {spot.band}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 300 }}>
              {spot.loc}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.65rem', fontWeight: 500,
              letterSpacing: '0.1em',
              padding: '0.2rem 0.6rem',
              border: spot.mode === 'CW' ? '0.5px solid rgba(74,171,109,0.3)' : '0.5px solid var(--border)',
              color: spot.mode === 'CW' ? 'var(--green)' : 'var(--amber-dim)',
              display: 'inline-block', marginBottom: '0.4rem',
            }}>{spot.mode}</span>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', color: 'var(--text-muted)' }}>
              {spot.age}
            </div>
          </div>
        </div>
      ))}

      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <a href="/spots" style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--amber)', textDecoration: 'none',
          borderBottom: '0.5px solid var(--amber)', paddingBottom: '2px',
        }}>
          View all spots →
        </a>
      </div>
    </section>
  )
}
