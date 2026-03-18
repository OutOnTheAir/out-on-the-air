import { createClient } from '@supabase/supabase-js'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
export const revalidate = 0

// ── Supabase (server-side, no auth needed for public read) ──────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ── Types ───────────────────────────────────────────────────────────────────
type Activation = {
  id: string
  callsign: string
  activation_date: string
  location_type: string
  location_desc: string
  country: string
  dxcc_code: string
  grid_square: string
  qso_count: number
  confirmed_count: number
  is_successful: boolean
  notes: string | null
  submitted_at: string
  created_at: string
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function locationLabel(type: string) {
  const map: Record<string, string> = {
    field:    'Field',
    park:     'Park',
    summit:   'Summit',
    beach:    'Beach',
    rooftop:  'Rooftop',
    mobile:   'Mobile',
    parking:  'Parking Lot',
    other:    'Field',
  }
  return map[type?.toLowerCase()] ?? type ?? 'Field'
}

function Divider() {
  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 2rem' }}>
      <div style={{ height: '0.5px', background: 'var(--border)' }} />
    </div>
  )
}

// ── Page (Server Component) ─────────────────────────────────────────────────
export default async function LogPage() {
  // Fetch latest 25 activations, newest first
  const { data: activations, error } = await supabase
    .from('activations')
    .select('*')
    .order('activation_date', { ascending: false })
    .limit(25)

  const log: Activation[] = activations ?? []

  // Stats
  const totalQSOs     = log.reduce((sum, a) => sum + (a.qso_count ?? 0), 0)
  const uniqueDXCC    = new Set(log.map(a => a.dxcc_code).filter(Boolean)).size
  const totalCount    = log.length

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <Nav />

      {/* ── Header ── */}
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

      {/* ── Stats Bar ── */}
      <section style={{ padding: '1.5rem 2rem', maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', border: '0.5px solid var(--border)' }}>
          {[
            { label: 'Total Activations', value: totalCount },
            { label: 'QSOs Logged',       value: totalQSOs  },
            { label: 'DXCC Entities',     value: uniqueDXCC },
          ].map(({ label, value }, i) => (
            <div key={label} style={{
              padding: '1.25rem',
              borderRight: i < 2 ? '0.5px solid var(--border)' : 'none',
              textAlign: 'center',
            }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, color: 'var(--amber)', marginBottom: '0.25rem' }}>{value}</p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── Filter Bar (UI only for now — full filtering needs client component) ── */}
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

      {/* ── Log Entries ── */}
      <section style={{ padding: '0 2rem 5rem', maxWidth: '960px', margin: '0 auto' }}>

        {error && (
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--amber)', marginBottom: '1rem' }}>
            ⚠ Could not load activations: {error.message}
          </p>
        )}

        {log.length === 0 && !error && (
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--text-dim)', textAlign: 'center', padding: '4rem 0' }}>
            No activations logged yet. Be the first.
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {log.map((entry) => (
            <div key={entry.id} style={{
              background: 'rgba(255,255,255,0.02)',
              border: '0.5px solid var(--border)',
              padding: '1.25rem 1.5rem',
              display: 'grid',
              gridTemplateColumns: '140px 1fr auto',
              gap: '1.5rem',
              alignItems: 'start',
            }}>
              {/* Callsign + Date */}
              <div>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: 700, color: 'var(--amber)', marginBottom: '0.25rem' }}>
                  {entry.callsign}
                </p>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.08em', color: 'var(--text-dim)' }}>
                  {formatDate(entry.activation_date)}
                </p>
              </div>

              {/* Location + Meta */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.6rem', letterSpacing: '0.1em',
                    padding: '0.2rem 0.6rem',
                    border: '0.5px solid var(--border)',
                    color: 'var(--text-dim)',
                  }}>
                    {locationLabel(entry.location_type)}
                  </span>
                  {entry.is_successful && (
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.6rem', letterSpacing: '0.1em',
                      padding: '0.2rem 0.6rem',
                      border: '0.5px solid var(--amber)',
                      color: 'var(--amber)',
                    }}>
                      SUCCESSFUL
                    </span>
                  )}
                </div>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: 'var(--text-dim)', marginBottom: '0.4rem' }}>
                  {entry.location_desc}
                  {entry.grid_square && (
                    <span style={{ opacity: 0.5, marginLeft: '0.75rem' }}>Grid: {entry.grid_square}</span>
                  )}
                  {entry.dxcc_code && (
                    <span style={{ opacity: 0.5, marginLeft: '0.75rem' }}>DXCC: {entry.dxcc_code}</span>
                  )}
                </p>
                {entry.notes && (
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', fontStyle: 'italic', color: 'var(--text-dim)', opacity: 0.7 }}>
                    &ldquo;{entry.notes}&rdquo;
                  </p>
                )}
              </div>

              {/* QSO Count */}
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>
                  {entry.qso_count ?? 0}
                </p>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.55rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                  QSOs
                </p>
                {entry.confirmed_count > 0 && (
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.55rem', color: 'var(--amber)', opacity: 0.7, marginTop: '0.15rem' }}>
                    {entry.confirmed_count} confirmed
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.65rem', letterSpacing: '0.08em',
          color: 'var(--text-dim)', opacity: 0.5,
          textAlign: 'center', marginTop: '2rem',
        }}>
          Showing most recent {log.length} activation{log.length !== 1 ? 's' : ''} · Pagination coming soon
        </p>
      </section>

      <Footer />
    </main>
  )
}
