import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const mockSpots = [
  {
    callsign: 'W1AW',
    frequency: '14.255',
    band: '20m',
    mode: 'SSB',
    location: 'Waterfront Park — New Haven, CT',
    grid: 'FN31',
    comment: 'Running 100W, dipole at 30ft, great conditions',
    spotter: 'K1ABC',
    minutesAgo: 2,
  },
  {
    callsign: 'VE3KGB',
    frequency: '7.032',
    band: '40m',
    mode: 'CW',
    location: 'Rooftop — Toronto, ON',
    grid: 'FN03',
    comment: 'QRP 5W, vertical, solid copy',
    spotter: 'VE3KGB',
    minutesAgo: 14,
  },
  {
    callsign: 'KD9ZZR',
    frequency: '28.450',
    band: '10m',
    mode: 'SSB',
    location: 'Parking Lot — Indianapolis, IN',
    grid: 'EM69',
    comment: '10m is wide open, mobile whip',
    spotter: 'W9XYZ',
    minutesAgo: 31,
  },
  {
    callsign: 'G4RZT',
    frequency: '3.755',
    band: '80m',
    mode: 'SSB',
    location: 'Rural Field — Devon, England',
    grid: 'IO80',
    comment: 'Long wire in the hedgerow, listening for NA',
    spotter: 'G4RZT',
    minutesAgo: 47,
  },
  {
    callsign: 'JA1XYZ',
    frequency: '1.835',
    band: '160m',
    mode: 'CW',
    location: 'Rooftop — Tokyo, Japan',
    grid: 'PM95',
    comment: 'Topband from a rooftop, rare opportunity',
    spotter: 'JH1ABC',
    minutesAgo: 61,
  },
  {
    callsign: 'N5QRP',
    frequency: '21.285',
    band: '15m',
    mode: 'SSB',
    location: 'State Park — Austin, TX',
    grid: 'EM10',
    comment: 'Portable setup, inverted V at 20ft',
    spotter: 'N5QRP',
    minutesAgo: 78,
  },
  {
    callsign: 'WB4GHD',
    frequency: '50.125',
    band: '6m',
    mode: 'SSB',
    location: 'Hilltop — Asheville, NC',
    grid: 'EM85',
    comment: 'Es season! Yagi pointed NE',
    spotter: 'K4DEF',
    minutesAgo: 95,
  },
  {
    callsign: 'VK2ABC',
    frequency: '7.144',
    band: '40m',
    mode: 'SSB',
    location: 'Beach — Sydney, NSW',
    grid: 'QF56',
    comment: 'Wire antenna in the dunes, good ground',
    spotter: 'VK2ABC',
    minutesAgo: 112,
  },
]

function timeLabel(minutes: number) {
  if (minutes < 60) return `${minutes}m ago`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m ago` : `${h}h ago`
}

function isSelfSpot(spot: typeof mockSpots[0]) {
  return spot.spotter === spot.callsign
}

export default function SpotsPage() {
  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <Nav />

      <section style={{ padding: '5rem 2rem 2rem', maxWidth: '960px', margin: '0 auto' }}>
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--amber)', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <span style={{ display: 'inline-block', width: '2rem', height: '0.5px', background: 'var(--amber)' }} />
          Live Spots
        </p>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            fontWeight: 700, lineHeight: 1.1,
            color: 'var(--text)',
          }}>
            Who&apos;s on the air<br />
            <em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>right now.</em>
          </h1>

          <a href="/spot/new" style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.7rem', fontWeight: 500,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            background: 'var(--amber)',
            color: '#0a0e14',
            padding: '0.75rem 1.5rem',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}>
            + Post a Spot
          </a>
        </div>

        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.7rem', lineHeight: 1.7,
          color: 'var(--text-dim)',
        }}>
          Updates every 60 seconds · Self-spotting encouraged · Voice and CW only
        </p>
      </section>

      <section style={{ padding: '0 2rem 2rem', maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['All Bands', '160m', '80m', '40m', '20m', '15m', '10m', '6m'].map((f, i) => (
            <div key={f} style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.65rem', letterSpacing: '0.08em',
              padding: '0.35rem 0.85rem',
              border: '0.5px solid',
              borderColor: i === 0 ? 'var(--amber)' : 'var(--border)',
              color: i === 0 ? 'var(--amber)' : 'var(--text-dim)',
              cursor: 'pointer',
            }}>
              {f}
            </div>
          ))}
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.65rem', letterSpacing: '0.08em',
            padding: '0.35rem 0.85rem',
            border: '0.5px solid var(--border)',
            color: 'var(--text-dim)',
            cursor: 'pointer',
            marginLeft: 'auto',
          }}>CW Only</div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.65rem', letterSpacing: '0.08em',
            padding: '0.35rem 0.85rem',
            border: '0.5px solid var(--border)',
            color: 'var(--text-dim)',
            cursor: 'pointer',
