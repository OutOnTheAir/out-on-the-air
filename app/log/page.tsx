import { createClient } from '@supabase/supabase-js'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import LogClient from './LogClient'

export const revalidate = 0

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type Activation = {
  id: string
  user_id: string
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
  band?: string | null
  mode?: string | null
  is_simplex?: boolean | null
  power_watts?: number | null
  temp_fahrenheit?: number | null
  satellite_name?: string | null
  contacted_states?: string | null
  contacted_continents?: string | null
  contacted_dxcc?: string | null
  a2a_callsign?: string | null
}

export default async function LogPage() {
  // First page of activations
  const { data: activations, error } = await supabase
    .from('activations')
    .select('*')
    .order('activation_date', { ascending: false })
    .range(0, 24)

  // Total count for pagination
  const { count: totalCount } = await supabase
    .from('activations')
    .select('*', { count: 'exact', head: true })

  // Global QSO total from the activation rows
  const { data: statsData } = await supabase
    .from('activations')
    .select('qso_count')

  const totalQSOs = statsData?.reduce((sum, a) => sum + (a.qso_count ?? 0), 0) ?? 0
  const totalActs = totalCount ?? 0

  // Distinct DXCC entities worked anywhere on OOTA. The worked_dxcc view
  // combines imported QSO countries, countries entered on the log forms,
  // and the entity each activator operated from. If the view is not there
  // yet (migration not run), the stat falls back to zero instead of
  // breaking the page.
  const { count: dxccCount } = await supabase
    .from('worked_dxcc')
    .select('*', { count: 'exact', head: true })

  const uniqueDXCC = dxccCount ?? 0

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <Nav />
      <LogClient
        initialActivations={activations ?? []}
        initialError={error?.message ?? null}
        totalCount={totalActs}
        totalQSOs={totalQSOs}
        uniqueDXCC={uniqueDXCC}
      />
      <Footer />
    </main>
  )
}
