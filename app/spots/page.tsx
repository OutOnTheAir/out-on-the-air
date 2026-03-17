'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

type Spot = {
  id: string
  callsign: string
  frequency_khz: number
  band: string
  mode: string
  location_desc: string
  comment: string
  posted_at: string
  is_active: boolean
}

function timeAgo(dateStr: string) {
  const minutes = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
  if (minutes < 60) return `${minutes}m ago`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m ago` : `${h}h ago`
}

export default function SpotsPage() {
  const [spots, setSpots] = useState<Spot[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All Bands')
  const [modeFilter, setModeFilter] = useState('All')

  async function fetchSpots() {
    let query = supabase
      .from('spots')
      .select('*')
      .eq('is_active', true)
      .order('posted_at', { ascending: false })
      .limit(50)

    if (filter !== 'All Bands') query = query.eq('band', filter)
    if (modeFilter === 'CW Only') query = query.eq('mode', 'CW')
    if (modeFilter === 'Voice Only') query = query.neq('mode', 'CW')

    const { data } = await query
    if (data) setSpots(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchSpots()
    const interval = setInterval(fetchSpots, 60000)
    return () => clearInterval(interval)
  }, [filter, modeFilter])

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
            fontWeight: 700, lineHeight: 1.1, color: 'var(--text)',
          }}>
            Who&apos;s on the air<br />
            <em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>right now.</em>
          </h1>
          <a href="/spot/new" style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.7rem', fontWeight: 500,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            background: 'var(--amber)', color: '#0a0e14',
            padding: '0.75rem 1.5rem', textDecoration: 'none', whiteSpace: 'nowrap',
          }}>+ Post a Spot</a>
        </div>

        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', lineHeight: 1.7, color: 'var(--text-dim)' }}>
          Updates every 60 seconds · Self-spotting encouraged · Voice and CW only
        </p>
      </section>

      {/* Filter Bar */}
      <section style={{ padding: '0 2rem 2rem', maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['All Bands', '160m', '80m', '40m', '20m', '15m', '10m', '6m'].map((f) => (
            <div key={f} onClick={() => setFilter(f)} style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.65rem', letterSpacing: '0.08em',
              padding: '0.35rem 0.85rem',
              border: '0.5px solid',
              borderColor: filter === f ? 'var(--amber)' : 'var(--border)',
              color: filter === f ? 'var(--amber)' : 'var(--text-dim)',
              cursor: 'pointer',
            }}>{f}</div>
          ))}
          {['All', 'CW Only', 'Voice Only'].map((f) => (
            <div key={f} onClick={() => setModeFilter(f)} style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.65rem', letterSpacing: '0.08em',
              padding: '0.35rem 0.85rem',
              border: '0.5px solid',
              borderColor: modeFilter === f ? 'var(--amber)' : 'var(--border)',
              color: modeFilter === f ? 'var(--amber)' : 'var(--text-dim)',
              cursor: 'pointer',
              marginLeft: f === 'All' ? 'auto' : '0',
            }}>{f}</div>
          ))}
        </div>
      </section>

      {/* Spots */}
      <section style={{ padding: '0 2rem 5rem', maxWidth: '960px', margin: '0 auto' }}>
        {loading ? (
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--text-dim)', textAlign: 'center', padding: '3rem 0' }}>
            Loading spots...
          </p>
        ) : spots.length === 0 ? (
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--text-dim)', textAlign: 'center', padding: '3rem 0' }}>
            No active spots right now. Be the first — post a spot.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {spots.map((spot) => (
              <div key={spot.id} style={{
                background: 'rgba(255,255,255,0.02)',
                border: '0.5px solid var(--border)',
                padding: '1.25rem 1.5rem',
                display: 'grid',
                gridTemplateColumns: '140px 1fr auto',
                gap: '1.5rem',
                alignItems: 'start',
              }}>
                <div>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: 700, color: 'var(--amber)', marginBottom: '0.25rem' }}>{spot.callsign}</p>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
                      {(spot.frequency_khz / 1000).toFixed(3)} MHz
                    </span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: 'var(--text-dim)' }}>— {spot.band}</span>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.1em',
                      padding: '0.2rem 0.6rem', border: '0.5px solid',
                      borderColor: spot.mode === 'CW' ? 'var(--amber)' : 'var(--border)',
                      color: spot.mode === 'CW' ? 'var(--amber)' : 'var(--text-dim)',
                    }}>{spot.mode}</span>
                  </div>
                  {spot.location_desc && (
                    <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: 'var(--text-dim)', marginBottom: '0.4rem' }}>{spot.location_desc}</p>
                  )}
                  {spot.comment && (
                    <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', fontStyle: 'italic', color: 'var(--text-dim)', opacity: 0.7 }}>&ldquo;{spot.comment}&rdquo;</p>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem',
                    color: new Date(spot.posted_at).getTime() > Date.now() - 900000 ? 'var(--amber)' : 'var(--text-dim)',
                    whiteSpace: 'nowrap',
                  }}>{timeAgo(spot.posted_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}
