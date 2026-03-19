'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const BAND_ORDER = ['160m', '80m', '40m', '30m', '20m', '17m', '15m', '12m', '10m', '6m', '2m']

const MODE_COLORS: Record<string, string> = {
  FT8:  'rgba(139,92,246,0.15)',
  SSB:  'rgba(16,185,129,0.15)',
  CW:   'rgba(245,158,11,0.15)',
  JS8:  'rgba(14,165,233,0.15)',
  AM:   'rgba(244,63,94,0.15)',
  FM:   'rgba(20,184,166,0.15)',
}

const MODE_TEXT: Record<string, string> = {
  FT8:  '#a78bfa',
  SSB:  '#6ee7b7',
  CW:   '#fcd34d',
  JS8:  '#7dd3fc',
  AM:   '#fda4af',
  FM:   '#5eead4',
}

interface Profile {
  id: string
  callsign: string
  display_name: string
  country: string
  grid_square: string
  bio: string
  avatar_url: string
  created_at: string
}

interface Activation {
  id: string
  callsign: string
  activation_date: string
  location_type: string
  location_desc: string
  grid_square: string
  qso_count: number
  is_successful: boolean
}

interface Award {
  award_id: string
  earned_at: string
  award_definitions: {
    name: string
    slug: string
    description: string
    type: string
  }
}

export default function OperatorProfilePage() {
  const params = useParams()
  const callsign = (params.callsign as string).toUpperCase()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [activations, setActivations] = useState<Activation[]>([])
  const [awards, setAwards] = useState<Award[]>([])
  const [bandCounts, setBandCounts] = useState<Record<string, number>>({})
  const [modeCounts, setModeCounts] = useState<Record<string, number>>({})
  const [totalQsos, setTotalQsos] = useState(0)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('callsign', callsign)
        .single()

      if (!profileData) {
        setNotFound(true)
        setLoading(false)
        return
      }
      setProfile(profileData)

      // Fetch activations by callsign
      const { data: activationData } = await supabase
        .from('activations')
        .select('*')
        .eq('callsign', callsign)
        .order('activation_date', { ascending: false })

      const acts = activationData ?? []
      setActivations(acts)

      const activationIds = acts.map((a: Activation) => a.id)
      const qsoTotal = acts.reduce((sum: number, a: Activation) => sum + (a.qso_count ?? 0), 0)
      setTotalQsos(qsoTotal)

      // Fetch QSOs for band/mode breakdown
      if (activationIds.length > 0) {
        const { data: qsoData } = await supabase
          .from('qsos')
          .select('band, mode')
          .in('activation_id', activationIds)

        const bands: Record<string, number> = {}
        const modes: Record<string, number> = {}
        ;(qsoData ?? []).forEach((q: { band: string; mode: string }) => {
          if (q.band) bands[q.band] = (bands[q.band] ?? 0) + 1
          if (q.mode) modes[q.mode] = (modes[q.mode] ?? 0) + 1
        })
        setBandCounts(bands)
        setModeCounts(modes)
      }

      // Fetch awards
      const { data: awardData } = await supabase
        .from('user_awards')
        .select('award_id, earned_at, award_definitions(name, slug, description, type)')
        .eq('user_id', profileData.id)
        .order('earned_at', { ascending: false })

      setAwards(awardData ?? [])
      setLoading(false)
    }

    load()
  }, [callsign])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0e14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: "'JetBrains Mono', monospace", color: '#555', fontSize: '0.75rem', letterSpacing: '0.2em' }}>LOADING...</p>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight: '100vh', background: '#0a0e14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <p style={{ fontFamily: "'Playfair Display', serif", color: '#c9a84c', fontSize: '2rem' }}>Callsign not found.</p>
      <Link href="/" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase' }}>← Back to OOTA</Link>
    </div>
  )

  const sortedBands = BAND_ORDER.filter(b => bandCounts[b])
  const sortedModes = Object.entries(modeCounts).sort((a, b) => b[1] - a[1])
  const memberSince = profile?.created_at ? new Date(profile.created_at).getFullYear() : '—'

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e14', color: '#f0ead6' }}>
      {/* Header */}
      <div style={{
        borderBottom: '0.5px solid #1e2530',
        background: 'linear-gradient(180deg, #0d1117 0%, #0a0e14 100%)',
        padding: '3rem 2rem 2.5rem',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.25em', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '1rem' }}>
            — Operator Profile
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '3.5rem', fontWeight: 700, color: '#f0ead6', margin: 0, lineHeight: 1 }}>
                {callsign}
              </h1>
              {profile?.display_name && (
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: '#888', marginTop: '0.5rem', letterSpacing: '0.05em' }}>
                  {profile.display_name}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '2rem' }}>
              {[
                ['QSOs', totalQsos],
                ['Activations', activations.length],
                ['Awards', awards.length],
                ['Member Since', memberSince],
              ].map(([label, value]) => (
                <div key={label as string} style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 700, color: '#c9a84c' }}>{value}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', color: '#555', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Meta row */}
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            {profile?.grid_square && (
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: '#555', letterSpacing: '0.1em' }}>
                Grid <span style={{ color: '#888' }}>{profile.grid_square}</span>
              </span>
            )}
            {profile?.country && (
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: '#555', letterSpacing: '0.1em' }}>
                {profile.country}
              </span>
            )}
          </div>

          {profile?.bio && (
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '0.9rem', color: '#888', marginTop: '1.25rem', lineHeight: 1.7, maxWidth: '600px', fontStyle: 'italic' }}>
              "{profile.bio}"
            </p>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

          {/* Bands */}
          {sortedBands.length > 0 && (
            <div style={{ border: '0.5px solid #1e2530', padding: '1.5rem' }}>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.2em', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Bands Worked</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {sortedBands.map(band => {
                  const count = bandCounts[band]
                  const max = Math.max(...sortedBands.map(b => bandCounts[b]))
                  const pct = Math.round((count / max) * 100)
                  return (
                    <div key={band} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: '#888', width: '36px', textAlign: 'right' }}>{band}</span>
                      <div style={{ flex: 1, height: '3px', background: '#1e2530', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: '#c9a84c' }} />
                      </div>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', color: '#555', width: '30px' }}>{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Modes */}
          {sortedModes.length > 0 && (
            <div style={{ border: '0.5px solid #1e2530', padding: '1.5rem' }}>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.2em', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Modes</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {sortedModes.map(([mode, count]) => (
                  <div key={mode} style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.65rem',
                    padding: '0.4rem 0.85rem',
                    background: MODE_COLORS[mode] ?? 'rgba(255,255,255,0.05)',
                    color: MODE_TEXT[mode] ?? '#888',
                    border: `0.5px solid ${MODE_TEXT[mode] ?? '#333'}22`,
                    letterSpacing: '0.1em',
                  }}>
                    {mode} <span style={{ opacity: 0.6 }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Awards */}
          {awards.length > 0 && (
            <div style={{ border: '0.5px solid #1e2530', padding: '1.5rem', gridColumn: '1 / -1' }}>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.2em', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Awards Earned</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {awards.map((a) => (
                  <div key={a.award_id} title={a.award_definitions?.description} style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.6rem',
                    padding: '0.4rem 0.85rem',
                    background: 'rgba(201,168,76,0.08)',
                    color: '#c9a84c',
                    border: '0.5px solid rgba(201,168,76,0.2)',
                    letterSpacing: '0.08em',
                    cursor: 'default',
                  }}>
                    {a.award_definitions?.name ?? a.award_id}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activations */}
          {activations.length > 0 && (
            <div style={{ border: '0.5px solid #1e2530', padding: '1.5rem', gridColumn: '1 / -1' }}>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.2em', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Recent Activations</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {activations.slice(0, 10).map((act, i) => (
                  <div key={act.id} style={{
                    display: 'grid',
                    gridTemplateColumns: '110px 1fr 80px 60px',
                    gap: '1rem',
                    padding: '0.7rem 0',
                    borderBottom: i < Math.min(activations.length, 10) - 1 ? '0.5px solid #1a1f28' : 'none',
                    alignItems: 'center',
                  }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: '#555' }}>
                      {new Date(act.activation_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span style={{ fontFamily: 'Georgia, serif', fontSize: '0.85rem', color: '#f0ead6' }}>
                      {act.location_desc || act.location_type || '—'}
                    </span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', color: '#888' }}>
                      {act.grid_square ?? '—'}
                    </span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: act.is_successful ? '#6ee7b7' : '#555', textAlign: 'right' }}>
                      {act.qso_count} QSO{act.qso_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        <div style={{ marginTop: '3rem', borderTop: '0.5px solid #1e2530', paddingTop: '1.5rem' }}>
          <Link href="/leaderboard" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
            ← Leaderboard
          </Link>
        </div>
      </div>
    </div>
  )
}
