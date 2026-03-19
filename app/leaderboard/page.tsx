'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Tab = 'qsos' | 'awards' | 'activations' | 'grids'

interface LeaderEntry {
  callsign: string
  value: number
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>('qsos')
  const [rows, setRows] = useState<LeaderEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setRows([])
    loadTab(tab)
  }, [tab])

  async function loadTab(t: Tab) {
    if (t === 'qsos') {
      // Sum qso_count from activations grouped by callsign
      const { data } = await supabase
        .from('activations')
        .select('callsign, qso_count')

      const totals: Record<string, number> = {}
      ;(data ?? []).forEach((r: { callsign: string; qso_count: number }) => {
        totals[r.callsign] = (totals[r.callsign] ?? 0) + (r.qso_count ?? 0)
      })
      setRows(toSorted(totals))
    }

    if (t === 'activations') {
      const { data } = await supabase
        .from('activations')
        .select('callsign')
        .eq('is_successful', true)

      const totals: Record<string, number> = {}
      ;(data ?? []).forEach((r: { callsign: string }) => {
        totals[r.callsign] = (totals[r.callsign] ?? 0) + 1
      })
      setRows(toSorted(totals))
    }

    if (t === 'awards') {
      // Join user_awards → profiles to get callsign
      const { data } = await supabase
        .from('user_awards')
        .select('user_id, profiles(callsign)')

      const totals: Record<string, number> = {}
      ;(data ?? []).forEach((r: { profiles: { callsign: string }[] | null }) => {
        const call = Array.isArray(r.profiles) ? r.profiles[0]?.callsign : (r.profiles as any)?.callsign
        if (call) totals[call] = (totals[call] ?? 0) + 1
      })
      setRows(toSorted(totals))
    }

    if (t === 'grids') {
      // Unique grids per callsign from activations
      const { data } = await supabase
        .from('activations')
        .select('callsign, grid_square')
        .not('grid_square', 'is', null)

      const gridSets: Record<string, Set<string>> = {}
      ;(data ?? []).forEach((r: { callsign: string; grid_square: string }) => {
        if (!gridSets[r.callsign]) gridSets[r.callsign] = new Set()
        if (r.grid_square) gridSets[r.callsign].add(r.grid_square.slice(0, 4).toUpperCase())
      })
      const totals: Record<string, number> = {}
      Object.entries(gridSets).forEach(([call, set]) => { totals[call] = set.size })
      setRows(toSorted(totals))
    }

    setLoading(false)
  }

  function toSorted(totals: Record<string, number>): LeaderEntry[] {
    return Object.entries(totals)
      .map(([callsign, value]) => ({ callsign, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 50)
  }

  const TABS: { id: Tab; label: string; unit: string }[] = [
    { id: 'qsos',        label: 'Total QSOs',         unit: 'QSOs' },
    { id: 'activations', label: 'Activations',         unit: 'Acts' },
    { id: 'awards',      label: 'Awards Earned',       unit: 'Awards' },
    { id: 'grids',       label: 'Unique Grids',        unit: 'Grids' },
  ]

  const maxVal = rows[0]?.value ?? 1

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e14', color: '#f0ead6' }}>
      {/* Header */}
      <div style={{ borderBottom: '0.5px solid #1e2530', padding: '3rem 2rem 0', background: 'linear-gradient(180deg, #0d1117 0%, #0a0e14 100%)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.25em', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            — Out on the Air
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '3rem', fontWeight: 700, color: '#f0ead6', margin: '0 0 2rem 0' }}>
            Leaderboard
          </h1>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0' }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.65rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  padding: '0.75rem 1.5rem',
                  background: 'none',
                  border: 'none',
                  borderBottom: tab === t.id ? '2px solid #c9a84c' : '2px solid transparent',
                  color: tab === t.id ? '#c9a84c' : '#555',
                  cursor: 'pointer',
                  transition: 'color 0.15s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 2rem' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", color: '#555', fontSize: '0.75rem', letterSpacing: '0.2em' }}>LOADING...</p>
          </div>
        ) : rows.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", color: '#555', fontSize: '0.75rem', letterSpacing: '0.1em' }}>No data yet — get on the air!</p>
          </div>
        ) : (
          <div>
            {/* Column headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr 120px 80px',
              gap: '1rem',
              padding: '0 0 0.75rem',
              borderBottom: '0.5px solid #1e2530',
              marginBottom: '0',
            }}>
              {['#', 'Callsign', '', TABS.find(t => t.id === tab)?.unit ?? ''].map((h, i) => (
                <span key={i} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.55rem', letterSpacing: '0.2em', color: '#444', textTransform: 'uppercase', textAlign: i === 3 ? 'right' : 'left' }}>
                  {h}
                </span>
              ))}
            </div>

            {rows.map((row, i) => {
              const pct = Math.round((row.value / maxVal) * 100)
              const isTop3 = i < 3
              const rankColors = ['#c9a84c', '#9ca3af', '#b45309']
              return (
                <div
                  key={row.callsign}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr 120px 80px',
                    gap: '1rem',
                    padding: '0.9rem 0',
                    borderBottom: '0.5px solid #1a1f28',
                    alignItems: 'center',
                    background: isTop3 ? 'rgba(201,168,76,0.02)' : 'none',
                  }}
                >
                  {/* Rank */}
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.7rem',
                    color: isTop3 ? rankColors[i] : '#333',
                    fontWeight: isTop3 ? 700 : 400,
                  }}>
                    {i + 1}
                  </span>

                  {/* Callsign */}
                  <Link href={`/op/${row.callsign}`} style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: isTop3 ? '#f0ead6' : '#ccc',
                    textDecoration: 'none',
                    letterSpacing: '0.02em',
                  }}>
                    {row.callsign}
                  </Link>

                  {/* Bar */}
                  <div style={{ height: '2px', background: '#1e2530', position: 'relative' }}>
                    <div style={{
                      position: 'absolute', left: 0, top: 0,
                      height: '100%', width: `${pct}%`,
                      background: isTop3 ? '#c9a84c' : '#2a3040',
                      transition: 'width 0.4s ease',
                    }} />
                  </div>

                  {/* Value */}
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.8rem',
                    color: isTop3 ? '#c9a84c' : '#888',
                    fontWeight: isTop3 ? 700 : 400,
                    textAlign: 'right',
                  }}>
                    {row.value.toLocaleString()}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
