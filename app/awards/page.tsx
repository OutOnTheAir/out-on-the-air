import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const milestones = [
  { name: 'First Light', threshold: '1 activation', description: 'You left home. You made contact. You are OOTA.' },
  { name: 'Field Operator', threshold: '5 activations', description: 'The field is starting to feel familiar.' },
  { name: 'Road Warrior', threshold: '25 activations', description: 'You go out regardless of conditions.' },
  { name: 'Wanderer', threshold: '50 activations', description: 'The road is the destination.' },
  { name: 'Pathfinder', threshold: '100 activations', description: 'You have found places others never will.' },
  { name: 'Phantom', threshold: '250 activations', description: 'You appear on the bands without warning.' },
  { name: 'Nomad', threshold: '500 activations', description: 'Home is wherever the antenna goes up.' },
  { name: 'Legend', threshold: '1,000+ activations', description: 'There is nothing left to prove. You do it anyway.' },
]

const bands = ['160m', '80m', '40m', '20m', '15m', '10m', '6m']

const modes = [
  { name: 'Voice', note: 'SSB · AM · FM simplex' },
  { name: 'Fist', note: 'CW only — no phone contacts' },
]

const grids = [
  { name: 'Grid Walker', threshold: '10 unique grids' },
  { name: 'Grid Chaser', threshold: '25 unique grids' },
  { name: 'Grid Hunter', threshold: '50 unique grids' },
  { name: 'Grid Master', threshold: '100 unique grids' },
]

const dxcc = [
  { name: 'DX Initiated', threshold: '5 DXCC entities' },
  { name: 'DX Operator', threshold: '15 DXCC entities' },
  { name: 'DX Pathfinder', threshold: '30 DXCC entities' },
]

const special = [
  { name: 'Night Owl', description: 'Complete an activation between 0000–0400 UTC. The bands belong to the patient.' },
  { name: 'Iron Winter', description: 'Activate in December, January, or February. Cold fingers, warm signal.' },
  { name: 'First of Year', description: 'Log an activation on January 1st. Start the year the right way.' },
  { name: 'Midnight Herald', description: 'Activate between 2300 UTC Dec 31 and 0200 UTC Jan 1. Be on the air when the year turns.' },
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase',
      color: 'var(--amber)', marginBottom: '2rem',
      display: 'flex', alignItems: 'center', gap: '0.75rem',
    }}>
      <span style={{ display: 'inline-block', width: '2rem', height: '0.5px', background: 'var(--amber)' }} />
      {children}
    </p>
  )
}

function Divider() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem' }}>
      <div style={{ height: '0.5px', background: 'var(--border)' }} />
    </div>
  )
}

export default function AwardsPage() {
  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <Nav />

      <section style={{ padding: '5rem 2rem 3rem', maxWidth: '900px', margin: '0 auto' }}>
        <SectionLabel>Awards</SectionLabel>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: 700, lineHeight: 1.1,
          color: 'var(--text)', marginBottom: '1.5rem',
        }}>
          Earned in the field.<br />
          <em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>Never handed out.</em>
        </h1>
        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.15rem', lineHeight: 1.8,
          color: 'var(--text-dim)', maxWidth: '600px',
        }}>
          OOTA awards recognize real operating — activations logged away from home,
          contacts made voice or fist, bands worked, grids crossed, and entities reached.
          28 awards at launch. All free. All earned.
        </p>
      </section>

      <Divider />

      <section style={{ padding: '3rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
        <SectionLabel>Activation Milestones</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {milestones.map((a, i) => (
            <div key={a.name} style={{
              display: 'grid',
              gridTemplateColumns: '2rem 180px 160px 1fr',
              alignItems: 'center',
              gap: '1.5rem',
              padding: '1.25rem 1.5rem',
              background: 'rgba(255,255,255,0.02)',
              border: '0.5px solid var(--border)',
            }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', color: 'var(--amber)', opacity: 0.5 }}>{String(i + 1).padStart(2, '0')}</span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', fontWeight: 600, color: 'var(--text)' }}>{a.name}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.08em', color: 'var(--amber)' }}>{a.threshold}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', lineHeight: 1.5, color: 'var(--text-dim)' }}>{a.description}</span>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      <section style={{ padding: '3rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
          <div>
            <SectionLabel>Band Endorsements</SectionLabel>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', lineHeight: 1.7, color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
              Earned by completing at least one activation on each band. Collect all seven.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {bands.map(band => (
                <div key={band} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--amber)', border: '0.5px solid var(--amber)', padding: '0.5rem 1rem' }}>
                  {band}
                </div>
              ))}
            </div>
          </div>
          <div>
            <SectionLabel>Mode Endorsements</SectionLabel>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', lineHeight: 1.7, color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
              Earned by completing a full activation using only that mode.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {modes.map(m => (
                <div key={m.name} style={{ padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.02)', border: '0.5px solid var(--border)' }}>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.25rem' }}>{m.name}</p>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: 'var(--text-dim)' }}>{m.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Divider />

      <section style={{ padding: '3rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
        <SectionLabel>Grid Awards</SectionLabel>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', lineHeight: 1.7, color: 'var(--text-dim)', marginBottom: '1.5rem', maxWidth: '560px' }}>
          Earned by activating from unique Maidenhead grid squares. Every grid you operate from counts — parking lots, hilltops, beaches, roadsides.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {grids.map(g => (
            <div key={g.name} style={{ padding: '1.25rem 1.5rem', background: 'rgba(255,255,255,0.02)', border: '0.5px solid var(--border)' }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.4rem' }}>{g.name}</p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.08em', color: 'var(--amber)' }}>{g.threshold}</p>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      <section style={{ padding: '3rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
        <SectionLabel>DXCC Entity Awards</SectionLabel>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', lineHeight: 1.7, color: 'var(--text-dim)', marginBottom: '1.5rem', maxWidth: '560px' }}>
          Earned by activating from or making contact with stations in unique DXCC entities. Take the radio international.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {dxcc.map(d => (
            <div key={d.name} style={{ padding: '1.25rem 1.5rem', background: 'rgba(255,255,255,0.02)', border: '0.5px solid var(--border)' }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.4rem' }}>{d.name}</p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.08em', color: 'var(--amber)' }}>{d.threshold}</p>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      <section style={{ padding: '3rem 2rem 5rem', maxWidth: '900px', margin: '0 auto' }}>
        <SectionLabel>Special &amp; Seasonal</SectionLabel>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', lineHeight: 1.7, color: 'var(--text-dim)', marginBottom: '1.5rem', maxWidth: '560px' }}>
          These awards don't care how many activations you have. They care when and how you operated.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {special.map(s => (
            <div key={s.name} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '0.5px solid var(--border)' }}>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '0.5rem' }}>Special</p>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>{s.name}</p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', lineHeight: 1.6, color: 'var(--text-dim)' }}>{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
