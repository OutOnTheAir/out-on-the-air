import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const mockLog = [
  {
    callsign: 'W1AW',
    date: '2026-03-17',
    location: 'Waterfront Park — New Haven, CT',
    grid: 'FN31',
    bands: ['20m', '40m'],
    modes: ['SSB'],
    qsos: 23,
    dxcc: 'United States',
    notes: 'Perfect conditions, worked EU on 20m',
  },
  {
    callsign: 'VE3KGB',
    date: '2026-03-17',
    location: 'Rooftop — Toronto, ON',
    grid: 'FN03',
    bands: ['40m'],
    modes: ['CW'],
    qsos: 11,
    dxcc: 'Canada',
    notes: 'QRP 5W, all CW, solid pile',
  },
  {
    callsign: 'G4RZT',
    date: '2026-03-16',
    location: 'Rural Field — Devon, England',
    grid: 'IO80',
    bands: ['80m', '40m'],
    modes: ['SSB'],
    qsos: 17,
    dxcc: 'England',
    notes: 'Long wire in the hedgerow',
  },
  {
    callsign: 'KD9ZZR',
    date: '2026-03-16',
    location: 'Parking Lot — Indianapolis, IN',
    grid: 'EM69',
    bands: ['10m'],
    modes: ['SSB'],
    qsos: 34,
    dxcc: 'United States',
    notes: '10m wide open, worked JA',
  },
  {
    callsign: 'JA1XYZ',
    date: '2026-03-15',
    location: 'Rooftop — Tokyo, Japan',
    grid: 'PM95',
    bands: ['160m'],
    modes: ['CW'],
    qsos: 8,
    dxcc: 'Japan',
    notes: 'Topband from downtown Tokyo',
  },
  {
    callsign: 'N5QRP',
    date: '2026-03-15',
    location: 'State Park — Austin, TX',
    grid: 'EM10',
    bands: ['15m', '20m'],
    modes: ['SSB'],
    qsos: 19,
    dxcc: 'United States',
    notes: 'Inverted V at 20ft, great DX',
  },
  {
    callsign: 'VK2ABC',
    date: '2026-03-14',
    location: 'Beach — Sydney, NSW',
    grid: 'QF56',
    bands: ['40m'],
    modes: ['SSB', 'CW'],
    qsos: 14,
    dxcc: 'Australia',
    notes: 'Wire in the dunes, worked NA long path',
  },
  {
    callsign: 'WB4GHD',
    date: '2026-03-14',
    location: 'Hilltop — Asheville, NC',
    grid: 'EM85',
    bands: ['6m'],
    modes: ['SSB'],
    qsos: 41,
    dxcc: 'United States',
    notes: 'Es opening, coast to coast',
  },
  {
    callsign: 'PA3ABC',
    date: '2026-03-13',
    location: 'Dike — Amsterdam, Netherlands',
    grid: 'JO22',
    bands: ['80m'],
    modes: ['SSB'],
    qsos: 9,
    dxcc: 'Netherlands',
    notes: 'Cold morning, good EU contacts',
  },
  {
    callsign: 'W7QRP',
    date: '2026-03-13',
    location: 'Forest Road — Bend, OR',
    grid: 'CN94',
    bands: ['40m', '20m'],
    modes: ['CW'],
    qsos: 22,
    dxcc: 'United States',
    notes: 'All CW, QRP, NORCAL doublet',
  },
]

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function Divider() {
  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 2rem' }}>
      <div style={{ height: '0.5px', background: 'var(--border)' }} />
    </div>
  )
}

export default function LogPage() {
  const totalQSOs = mockLog.reduce((sum, a) => sum + a.qsos, 0)
  const uniqueDXCC = new Set(mockLog.map(a => a.dxcc)).size

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
          Activation Log
        </p>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            fontWeight: 700, lineHeight: 1.1,
            color: 'var(--text)',
          }}>
            Every activation.<br />
            <em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>Every contact.</em>
          </h1>

          <a href="/register" style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.7rem', fontWeight: 500,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            background: 'var(--amber)',
            color: '#0a0e14',
            padding: '0.75rem 1.5rem',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}>
            + Log an Activation
          </a>
        </div>

        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.7rem', lineHeight: 1.7,
          color: 'var(--text-dim)',
        }}>
          The permanent record of OOTA activations · Voice and CW only · Honor system
        </p>
      </section>

      <section style={{ padding: '1.5rem 2rem', maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', border: '0.5px solid var(--border)' }}>
          {[
            { label: 'Total Activations', value: mockLog.length },
            { label: 'QSOs Logged', value: totalQSOs },
            { label: 'DXCC Entities', value: uniqueDXCC },
          ].map(({ label, value }) => (
            <div key={label} style={{ padding: '1.25rem', borderRight: '0.5px solid var(--border)', textAlign: 'center' }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, color: 'var(--amber)', marginBottom: '0.25rem' }}>{value}</p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      <section style={{ padding: '1.5rem 2rem', maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginRight: '0.5rem' }}>Filter:</span>
          {['All', 'CW Only', 'Voice Only', 'This Week', 'This Month'].map((f, i) => (
            <div key={f} style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.65rem', letterSpacing: '0.08em',
              padding: '0.35rem 0.85rem',
              border: '0.5px solid',
              borderColor: i === 0 ? 'var(--amber)' : 'var(--border)',
              color: i === 0 ? 'var(--amber)' : 'var(--text-dim)',
              cursor: 'pointer',
            }}>{f}</div>
          ))}
        </div>
      </section>

      <section style={{ padding: '0 2rem 5rem', maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {mockLog.map((entry, idx) => (
            <div key={idx} style={{
              background: 'rgba(255,255,255,0.02)',
              border: '0.5px solid var(--border)',
              padding: '1.25rem 1.5rem',
              display: 'grid',
              gridTemplateColumns: '140px 1fr auto',
              gap: '1.5rem',
              alignItems: 'start',
            }}>
              <div>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: 700, color: 'var(--amber)', marginBottom: '0.25rem' }}>{entry.callsign}</p>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.08em', color: 'var(--text-dim)' }}>{formatDate(entry.date)}</p>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                  {entry.bands.map(b => (
                    <span key={b} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.1em', padding: '0.2rem 0.6rem', border: '0.5px solid var(--border)', color: 'var(--text-dim)' }}>{b}</span>
                  ))}
                  {entry.modes.map(m => (
                    <span key={m} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.1em', padding: '0.2rem 0.6rem', border: '0.5px solid', borderColor: m === 'CW' ? 'var(--amber)' : 'var(--border)', color: m === 'CW' ? 'var(--amber)' : 'var(--text-dim)' }}>{m}</span>
                  ))}
                </div>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: 'var(--text-dim)', marginBottom: '0.4rem' }}>
                  {entry.location}
                  <span style={{ opacity: 0.5, marginLeft: '0.75rem' }}>Grid: {entry.grid}</span>
                  <span style={{ opacity: 0.5, marginLeft: '0.75rem' }}>DXCC: {entry.dxcc}</span>
                </p>
                {entry.notes && (
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', fontStyle: 'italic', color: 'var(--text-dim)', opacity: 0.7 }}>&ldquo;{entry.notes}&rdquo;</p>
                )}
              </div>

              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>{entry.qsos}</p>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.55rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>QSOs</p>
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.08em', color: 'var(--text-dim)', opacity: 0.5, textAlign: 'center', marginTop: '2rem' }}>
          Showing mock data · Live activations will appear here once the database is connected
        </p>
      </section>

      <Footer />
    </main>
  )
}
