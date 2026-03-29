import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    global: {
      fetch: (url, options) =>
        fetch(url, { ...options, cache: 'no-store' }),
    },
  }
)

export const revalidate = 0

export default async function StatsBar() {
  // Total activations
  const { count: activationCount } = await supabase
    .from('activations')
    .select('*', { count: 'exact', head: true })

  // Total QSOs — count actual rows in qsos table
  const { count: totalQSOs } = await supabase
    .from('qsos')
    .select('*', { count: 'exact', head: true })

  // Unique DXCC entities
  const { data: dxccData } = await supabase
    .from('activations')
    .select('dxcc_code')
  const uniqueDXCC = new Set(dxccData?.map(r => r.dxcc_code).filter(Boolean)).size

  // Total operators (users)
  const { count: operatorCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  // On air now (active spots in last 2 hours)
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  const { count: onAirCount } = await supabase
    .from('spots')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .gte('posted_at', twoHoursAgo)

  const stats = [
    { num: (activationCount ?? 0).toLocaleString(), label: 'Activations' },
    { num: (totalQSOs ?? 0).toLocaleString(),       label: 'QSOs Logged' },
    { num: uniqueDXCC.toLocaleString(),             label: 'DXCC Entities' },
    { num: (operatorCount ?? 0).toLocaleString(),   label: 'Operators' },
    { num: (onAirCount ?? 0).toLocaleString(),      label: 'On Air Now' },
  ]

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
