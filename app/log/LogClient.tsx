'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { type Activation } from './page'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const PAGE_SIZE = 25

type Filter = 'all' | 'cw' | 'voice' | 'week' | 'month'

const VOICE_MODES = ['ssb', 'usb', 'lsb', 'am', 'fm', 'ph']
const CW_MODES    = ['cw']

interface Props {
  initialActivations: Activation[]
  initialError: string | null
  totalCount: number
  totalQSOs: number
  uniqueDXCC: number
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function locationLabel(type: string) {
  const map: Record<string, string> = {
    field: 'Field', park: 'Park', summit: 'Summit',
    beach: 'Beach', rooftop: 'Rooftop', mobile: 'Mobile',
    parking: 'Parking Lot', parking_lot: 'Parking Lot', other: 'Field',
    rural: 'Rural', vehicle: 'Vehicle', vessel: 'Vessel',
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

async function getActivationIdsByMode(modes: string[]): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('qsos')
    .select('activation_id, mode')

  if (error || !data) return new Set()

  const map = new Map<string, string[]>()
  for (const q of data) {
    if (!map.has(q.activation_id)) map.set(q.activation_id, [])
    map.get(q.activation_id)!.push(q.mode?.toLowerCase() ?? '')
  }

  const result = new Set<string>()
  for (const [id, qsoModes] of map) {
    if (qsoModes.length > 0 && qsoModes.every(m => modes.includes(m))) {
      result.add(id)
    }
  }
  return result
}

export default function LogClient({
  initialActivations,
  initialError,
  totalCount,
  totalQSOs,
  uniqueDXCC,
}: Props) {
  const [activations, setActivations]     = useState<Activation[]>(initialActivations)
  const [page, setPage]                   = useState(0)
  const [filter, setFilter]               = useState<Filter>('all')
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState<string | null>(initialError)
  const [filteredTotal, setFilteredTotal] = useState<number | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [deletingId, setDeletingId]       = useState<string | null>(null)

  const displayTotal = filteredTotal ?? totalCount
  const totalPages   = Math.ceil(displayTotal / PAGE_SIZE)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setCurrentUserId(data.session?.user?.id ?? null)
    })
  }, [])

  async function handleDelete(activationId: string) {
    if (!confirm('Delete this activation? This cannot be undone.')) return
    setDeletingId(activationId)
    const { error } = await supabase
      .from('activations')
      .delete()
      .eq('id', activationId)
      .eq('user_id', currentUserId!)
    if (error) {
      alert('Could not delete activation. Please try again.')
    } else {
      setActivations(prev => prev.filter(a => a.id !== activationId))
    }
    setDeletingId(null)
  }

  async function fetchPage(newPage: number, newFilter: Filter) {
    setLoading(true)
    setError(null)

    try {
      let modeIds: Set<string> | null = null
      if (newFilter === 'cw')    modeIds = await getActivationIdsByMode(CW_MODES)
      if (newFilter === 'voice') modeIds = await getActivationIdsByMode(VOICE_MODES)

      if (modeIds !== null && modeIds.size === 0) {
        setActivations([])
        setFilteredTotal(0)
        setPage(newPage)
        setLoading(false)
        return
      }

      let query = supabase
        .from('activations')
        .select('*')
        .order('activation_date', { ascending: false })
        .range(newPage * PAGE_SIZE, newPage * PAGE_SIZE + PAGE_SIZE - 1)

      if (newFilter === 'week') {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        query = query.gte('activation_date', weekAgo.toISOString().split('T')[0])
      } else if (newFilter === 'month') {
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        query = query.gte('activation_date', monthAgo.toISOString().split('T')[0])
      }

      if (modeIds !== null) {
        query = query.in('id', Array.from(modeIds))
      }

      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError

      setActivations(data ?? [])
      setFilteredTotal(modeIds !== null ? modeIds.size : null)
      setPage(newPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function handleFilter(newFilter: Filter) {
    setFilter(newFilter)
    fetchPage(0, newFilter)
  }

  function handlePage(newPage: number) {
    fetchPage(newPage, filter)
  }

  return (
    <>
      {/* Header */}
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
            fontWeight: 700, lineHeight: 1.1, color: 'var(--text)',
          }}>
            Every activation.<br />
            <em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>Every contact.</em>
          </h1>
          <a href="/spot/new" style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.7rem', fontWeight: 500,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            background: 'var(--amber)', color: '#0a0e14',
            padding: '0.75rem 1.5rem', textDecoration: 'none', whiteSpace: 'nowrap',
          }}>
            + Log an Activation
          </a>
        </div>

        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', lineHeight: 1.7, color: 'var(--text-dim)' }}>
          The permanent record of OOTA activations · Voice and CW only · Honor system
        </p>
      </section>

      {/* Stats Bar */}
      <section style={{ padding: '1.5rem 2rem', maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', border: '0.5px solid var(--border)' }}>
          {[
            { label: 'Total Activations', value: totalCount.toLocaleString() },
            { label: 'QSOs Logged',       value: totalQSOs.toLocaleString() },
            { label: 'DXCC Entities',     value: uniqueDXCC.toLocaleString() },
          ].map(({ label, value }, i) => (
            <div key={label} style={{
              padding: '1.25rem', textAlign: 'center',
              borderRight: i < 2 ? '0.5px solid var(--border)' : 'none',
            }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, color: 'var(--amber)', marginBottom: '0.25rem' }}>{value}</p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* Filter Bar */}
      <section style={{ padding: '1.5rem 2rem', maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginRight: '0.5rem' }}>Filter:</span>
          {([
            { key: 'all',   label: 'All' },
            { key: 'cw',    label: 'CW Only' },
            { key: 'voice', label: 'Voice Only' },
            { key: 'week',  label: 'This Week' },
            { key: 'month', label: 'This Month' },
          ] as { key: Filter; label: string }[]).map(f => (
            <button
              key={f.key}
              onClick={() => handleFilter(f.key)}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.65rem', letterSpacing: '0.08em',
                padding: '0.35rem 0.85rem',
                border: '0.5px solid',
                borderColor: filter === f.key ? 'var(--amber)' : 'var(--border)',
                color: filter === f.key ? 'var(--amber)' : 'var(--text-dim)',
                background: 'transparent', cursor: 'pointer',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* Log Entries */}
      <section style={{ padding: '0 2rem 3rem', maxWidth: '960px', margin: '0 auto' }}>
        {error && (
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--amber)', marginBottom: '1rem' }}>
            ⚠ Could not load activations: {error}
          </p>
        )}

        {loading && (
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--text-dim)', textAlign: 'center', padding: '3rem 0' }}>
            Loading...
          </p>
        )}

        {!loading && activations.length === 0 && !error && (
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--text-dim)', textAlign: 'center', padding: '4rem 0' }}>
            No activations found.
          </p>
        )}

        {!loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {activations.map((entry) => (
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
                  {currentUserId && entry.user_id === currentUserId && (
                    <button
                      onClick={() => handleDelete(entry.id)}
                      disabled={deletingId === entry.id}
                      style={{
                        marginTop: '0.5rem',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.55rem', letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        background: 'transparent',
                        border: '0.5px solid #ff6b6b',
                        color: '#ff6b6b',
                        padding: '0.2rem 0.5rem',
                        cursor: deletingId === entry.id ? 'not-allowed' : 'pointer',
                        opacity: deletingId === entry.id ? 0.5 : 1,
                      }}
                    >
                      {deletingId === entry.id ? 'Deleting…' : 'Delete'}
                    </button>
                  )}
                </div>

                {/* Location + Meta */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.6rem', letterSpacing: '0.1em',
                      padding: '0.2rem 0.6rem',
                      border: '0.5px solid var(--border)', color: 'var(--text-dim)',
                    }}>
                      {locationLabel(entry.location_type)}
                    </span>
                    {entry.is_successful && (
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.6rem', letterSpacing: '0.1em',
                        padding: '0.2rem 0.6rem',
                        border: '0.5px solid var(--amber)', color: 'var(--amber)',
                      }}>
                        SUCCESSFUL
                      </span>
                    )}
                  </div>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: 'var(--text-dim)', marginBottom: '0.4rem' }}>
                    {entry.location_desc}
                    {entry.grid_square && <span style={{ opacity: 0.5, marginLeft: '0.75rem' }}>Grid: {entry.grid_square}</span>}
                    {entry.dxcc_code   && <span style={{ opacity: 0.5, marginLeft: '0.75rem' }}>DXCC: {entry.dxcc_code}</span>}
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
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.5rem', marginTop: '2rem',
          }}>
            <button
              onClick={() => handlePage(page - 1)}
              disabled={page === 0 || loading}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.65rem', letterSpacing: '0.1em',
                padding: '0.5rem 1rem',
                border: '0.5px solid var(--border)',
                color: page === 0 ? 'var(--text-dim)' : 'var(--text)',
                background: 'transparent', cursor: page === 0 ? 'not-allowed' : 'pointer',
                opacity: page === 0 ? 0.4 : 1,
              }}
            >
              ← Prev
            </button>

            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.65rem', color: 'var(--text-dim)',
              padding: '0 1rem',
            }}>
              Page {page + 1} of {totalPages}
            </span>

            <button
              onClick={() => handlePage(page + 1)}
              disabled={page >= totalPages - 1 || loading}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.65rem', letterSpacing: '0.1em',
                padding: '0.5rem 1rem',
                border: '0.5px solid var(--border)',
                color: page >= totalPages - 1 ? 'var(--text-dim)' : 'var(--text)',
                background: 'transparent', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                opacity: page >= totalPages - 1 ? 0.4 : 1,
              }}
            >
              Next →
            </button>
          </div>
        )}

        {/* Footer note */}
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.65rem', letterSpacing: '0.08em',
          color: 'var(--text-dim)', opacity: 0.5,
          textAlign: 'center', marginTop: '1.5rem',
        }}>
          Showing {((page) * PAGE_SIZE) + 1}–{Math.min((page + 1) * PAGE_SIZE, displayTotal)} of {displayTotal.toLocaleString()} activation{displayTotal !== 1 ? 's' : ''}
          {filter !== 'all' && filter !== 'week' && filter !== 'month' && (
            <span style={{ marginLeft: '0.5rem', color: 'var(--amber)' }}>
              · {filter === 'cw' ? 'CW only' : 'Voice only'}
            </span>
          )}
        </p>
      </section>
    </>
  )
}
