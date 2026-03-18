import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

const whyItems = [
  { tag: 'Inclusive', title: 'No barriers', body: 'No summits. No park lists. No hiking required. A parking lot, a pier, a rooftop — if you left home, you qualify.' },
  { tag: 'Human', title: 'Voice or fist', body: 'SSB, AM, FM simplex, or CW only. Every contact is a real person. No bots, no FT8, no computers talking to computers.' },
  { tag: 'Simple', title: 'One QSO', body: "One confirmed contact is a successful activation. We're not here to gatekeep. Just get out and make radio happen." },
  { tag: 'Global', title: '160 to 6 meters', body: 'The full HF spectrum plus 6 meters. Five watts and a wire in a tree. A kilowatt and a beam. It all counts.' },
]

export default function AboutPage() {
  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <Nav />

      {/* Hero */}
      <section style={{ padding: '5rem 2rem 3rem', maxWidth: '860px', margin: '0 auto' }}>
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--amber)', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <span style={{ display: 'inline-block', width: '2rem', height: '0.5px', background: 'var(--amber)' }} />
          About OOTA
        </p>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: 700, lineHeight: 1.1,
          color: 'var(--text)', marginBottom: '1.5rem',
        }}>
          Radio the way it was<br />
          <em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>meant to be heard.</em>
        </h1>
        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.2rem', lineHeight: 1.8,
          color: 'var(--text-dim)', maxWidth: '640px',
        }}>
          Out On The Air is an amateur radio activation program administered under
          callsign WW1ZRD. It exists for one reason: to get operators off the bench
          and onto the air, human to human, voice or fist.
        </p>
      </section>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ height: '0.5px', background: 'var(--border)' }} />
      </div>

      {/* Mission */}
      <section style={{ padding: '3rem 2rem', maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ borderLeft: '2px solid var(--amber)', paddingLeft: '1.5rem', marginBottom: '3rem' }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontStyle: 'italic', color: 'var(--text)', lineHeight: 1.7 }}>
            "The soul of OOTA is human-to-human connection through skill and radio craft."
          </p>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--amber)', marginTop: '0.75rem' }}>
            — WW1ZRD, Program Administrator
          </p>
        </div>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', lineHeight: 1.9, color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
          OOTA was built as a reaction to the drift toward digital modes, automated
          contacts, and computer-to-computer exchanges. There is nothing wrong with
          those pursuits — but they are not OOTA. Here, every contact is a real
          person on the other end of a real signal, found through real skill.
        </p>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', lineHeight: 1.9, color: 'var(--text-dim)' }}>
          A parking lot counts. A pier counts. A rooftop at midnight counts. If you
          left home and you made a contact — voice or CW — you are Out On The Air.
        </p>
      </section>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ height: '0.5px', background: 'var(--border)' }} />
      </div>

      {/* Why OOTA */}
      <section style={{ padding: '3rem 2rem', maxWidth: '860px', margin: '0 auto' }}>
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--amber)', marginBottom: '2rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <span style={{ display: 'inline-block', width: '2rem', height: '0.5px', background: 'var(--amber)' }} />
          Why OOTA?
        </p>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1px', background: 'var(--border-dim)',
          border: '0.5px solid var(--border-dim)',
        }}>
          {whyItems.map((item, i) => (
            <div key={i} style={{ background: 'var(--bg)', padding: '2rem 1.75rem' }}>
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
      </section>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ height: '0.5px', background: 'var(--border)' }} />
      </div>

      {/* Rules Summary */}
      <section style={{ padding: '3rem 2rem', maxWidth: '860px', margin: '0 auto' }}>
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--amber)', marginBottom: '2rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <span style={{ display: 'inline-block', width: '2rem', height: '0.5px', background: 'var(--amber)' }} />
          The Rules
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {[
            { label: 'Modes', value: 'SSB · AM · FM · CW', note: 'Voice simplex or CW only. No FT8, no digital, no repeaters.' },
            { label: 'Bands', value: '160m through 6m', note: 'The full HF spectrum plus 6 meters. Any power level.' },
            { label: 'Minimum', value: 'One confirmed QSO', note: "One real contact is a successful activation. That's it." },
            { label: 'Location', value: 'Away from home QTH', note: 'Any location except your home station qualifies.' },
            { label: 'Logging', value: 'Self-reported', note: 'Log your activation here. Honor system. This is amateur radio.' },
            { label: 'Cost', value: 'Free. Always.', note: 'OOTA will never charge to participate. No exceptions.' },
          ].map(({ label, value, note }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid var(--border)', padding: '1.5rem' }}>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '0.5rem' }}>{label}</p>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>{value}</p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', lineHeight: 1.6, color: 'var(--text-dim)' }}>{note}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ height: '0.5px', background: 'var(--border)' }} />
      </div>

      {/* Administrator */}
      <section style={{ padding: '3rem 2rem 5rem', maxWidth: '860px', margin: '0 auto' }}>
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--amber)', marginBottom: '2rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <span style={{ display: 'inline-block', width: '2rem', height: '0.5px', background: 'var(--amber)' }} />
          Administrator
        </p>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid var(--border)', padding: '1.5rem 2rem', minWidth: '200px' }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, color: 'var(--amber)', marginBottom: '0.25rem' }}>WW1ZRD</p>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Program Administrator</p>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.1em', color: 'var(--text-dim)', marginTop: '0.5rem' }}>Grid FN57TI · Maine</p>
          </div>
          <div style={{ flex: 1, minWidth: '260px' }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', lineHeight: 1.9, color: 'var(--text-dim)', marginBottom: '1rem' }}>
              OOTA is administered by WW1ZRD, a licensed amateur radio operator
              in Maine. The program is operated under EmberStorm LLC and administered
              at outontheair.com.
            </p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', lineHeight: 1.9, color: 'var(--text-dim)' }}>
              Questions, activations, and correspondence can be directed to{' '}
              <a href="mailto:outontheair@outlook.com" style={{ color: 'var(--amber)', textDecoration: 'none', borderBottom: '0.5px solid var(--amber)' }}>
                outontheair@outlook.com
              </a>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
