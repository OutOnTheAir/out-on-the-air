import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const revalidate = 0

function timeAgo(dateStr: string) {
  const minutes = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
  if (minutes < 60) return `${minutes}m ago`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m ago` : `${h}h ago`
}

export default async function SpotsBoard() {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()

  const { data: spots } = await supabase
    .from('spots')
    .select('*')
    .eq('is_active', true)
    .gte('posted_at', twoHoursAgo)
    .order('posted_at', { ascending: false })
    .limit(5)

  return (
    <section id="spots" style={{ padding: '4rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: '1.5rem', paddingBottom: '0.75rem',
        borderBottom: '0.5px solid var(--border-dim)',
      }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: 600 }}>
          <span style={{
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

      {!spots || spots.length === 0 ? (
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.7rem', color: 'var(--text-dim)',
          textAlign: 'center', padding: '2rem 0',
        }}>
          No active spots right now. Be the first —{' '}
          <a href="/spot/new" style={{ color: 'var(--amber)', textDecoration: 'none' }}>post a spot</a>.
        </p>
      ) : (
        spots.map((spot) => (
          <div key={spot.id} style={{
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
            }}>{spot.callsign}</div>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: 'var(--text)', marginBottom: '0.2rem' }}>
                {(spot.frequency_khz / 1000).toFixed(3)} MHz — {spot.band}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 300 }}>
                {spot.location_desc}
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
                {timeAgo(spot.posted_at)}
              </div>
            </div>
          </div>
        ))
      )}

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
