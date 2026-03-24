import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

type Sponsor = {
  tier: 'Expedition' | 'Field' | 'Station'
  name: string
  url: string
  logo?: string
  tagline: string
  why?: string
}

const sponsors: Sponsor[] = [
  // Add sponsors here as they come on board. Example structure:
  // {
  //   tier: 'Expedition',
  //   name: 'WandTenna',
  //   url: 'https://wandtenna.com',
  //   tagline: 'Handcrafted EFHW antennas for the field operator.',
  //   why: 'WandTenna believes in getting operators out of the shack and onto the air.',
  // },
]

const tiers = [
  {
    id: 'Expedition' as const,
    label: 'Expedition Sponsors',
    description: 'Flagship supporters of the OOTA program.',
  },
  {
    id: 'Field' as const,
    label: 'Field Sponsors',
    description: 'Core supporters keeping OOTA on the air.',
  },
  {
    id: 'Station' as const,
    label: 'Station Sponsors',
    description: 'Community supporters of the OOTA mission.',
  },
]

export default function SponsorsPage() {
  const anySponsors = sponsors.length > 0

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <Nav />

      <section style={{ padding: '5rem 2rem 3rem', maxWidth: '860px', margin: '0 auto' }}>
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--amber)', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <span style={{ display: 'inline-block', width: '2rem', height: '0.5px', background: 'var(--amber)' }} />
          Sponsors
        </p>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2rem, 4vw, 3.25rem)',
          fontWeight: 700, lineHeight: 1.1,
          color: 'var(--text)', marginBottom: '1.5rem',
        }}>
          Who makes OutOnTheAir<br />
          <em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>possible.</em>
        </h1>

        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.05rem', lineHeight: 1.9,
          color: 'var(--text-dim)', maxWidth: '640px', marginBottom: '0.75rem',
        }}>
          OOTA is free for every operator, everywhere, always. These organizations
          make that possible by sponsoring the platform directly. We're grateful
          for their support of the amateur radio community.
        </p>

        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.68rem', lineHeight: 1.7,
          color: 'var(--text-dim)', maxWidth: '640px',
        }}>
          Interested in sponsoring OOTA?{' '}
          <a href="mailto:outontheair@outlook.com" style={{ color: 'var(--amber)', textDecoration: 'none', borderBottom: '0.5px solid var(--amber)' }}>
            Get in touch →
          </a>
        </p>
      </section>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ height: '0.5px', background: 'var(--border)' }} />
      </div>

      {!anySponsors ? (
        <section style={{ padding: '4rem 2rem 6rem', maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase',
            color: 'var(--text-dim)', marginBottom: '1rem',
          }}>
            No sponsors yet
          </p>
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.1rem', color: 'var(--text-dim)', lineHeight: 1.8,
          }}>
            We're just getting started. If your organization supports amateur radio
            and wants to reach thousands of active operators,{' '}
            <a href="mailto:outontheair@outlook.com" style={{ color: 'var(--amber)', textDecoration: 'none', borderBottom: '0.5px solid var(--amber)' }}>
              we'd love to hear from you.
            </a>
          </p>
        </section>
      ) : (
        <div>
          {tiers.filter(tier => sponsors.some(s => s.tier === tier.id)).map(tier => (
            <section key={tier.id} style={{ padding: '3rem 2rem', maxWidth: '860px', margin: '0 auto' }}>
              <p style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase',
                color: 'var(--amber)', marginBottom: '0.5rem',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
              }}>
                <span style={{ display: 'inline-block', width: '2rem', height: '0.5px', background: 'var(--amber)' }} />
                {tier.label}
              </p>
              <p style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.65rem', color: 'var(--text-dim)',
                letterSpacing: '0.05em', marginBottom: '2rem',
              }}>
                {tier.description}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
                {sponsors.filter(s => s.tier === tier.id).map((sponsor, i) => (
                  <div
                    key={i}
                    onClick={() => window.open(sponsor.url, '_blank', 'noopener,noreferrer')}
                    style={{
                      border: '0.5px solid var(--border)',
                      padding: '2rem',
                      background: 'rgba(255,255,255,0.02)',
                      boxSizing: 'border-box',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--amber)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                  >
                    {sponsor.logo && (
                      <img
                        src={sponsor.logo}
                        alt={sponsor.name}
                        style={{ maxHeight: '48px', maxWidth: '160px', objectFit: 'contain', marginBottom: '1.25rem', display: 'block' }}
                      />
                    )}
                    <p style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: '1.2rem', fontWeight: 700,
                      color: 'var(--amber)', marginBottom: '0.5rem',
                    }}>
                      {sponsor.name}
                    </p>
                    <p style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.68rem', lineHeight: 1.6,
                      color: 'var(--text-dim)', marginBottom: sponsor.why ? '1rem' : '0',
                    }}>
                      {sponsor.tagline}
                    </p>
                    {sponsor.why && (
                      <p style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '0.9rem', lineHeight: 1.7,
                        color: 'var(--text-dim)', fontStyle: 'italic',
                        borderTop: '0.5px solid var(--border)',
                        paddingTop: '1rem', marginTop: '1rem',
                      }}>
                        "{sponsor.why}"
                      </p>
                    )}
                    <p style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.6rem', letterSpacing: '0.1em',
                      textTransform: 'uppercase', color: 'var(--amber)',
                      marginTop: '1.25rem',
                    }}>
                      Visit {sponsor.name} →
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ height: '0.5px', background: 'var(--border)' }} />
      </div>

      <section style={{ padding: '3rem 2rem 5rem', maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--text-dim)', marginBottom: '1rem',
        }}>
          Sponsorship Tiers
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1px', background: 'var(--border-dim)', border: '0.5px solid var(--border-dim)', marginBottom: '2rem' }}>
          {tiers.map(tier => (
            <div key={tier.id} style={{ background: 'var(--bg)', padding: '1.5rem' }}>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '0.5rem' }}>
                {tier.id}
              </p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
                {tier.description}
              </p>
            </div>
          ))}
        </div>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: 'var(--text-dim)', lineHeight: 1.7 }}>
          To discuss sponsorship opportunities, contact{' '}
          <a href="mailto:outontheair@outlook.com" style={{ color: 'var(--amber)', textDecoration: 'none', borderBottom: '0.5px solid var(--amber)' }}>
            outontheair@outlook.com
          </a>
        </p>
      </section>

      <Footer />
    </main>
  )
}
