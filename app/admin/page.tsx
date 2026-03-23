'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

type Profile = {
  id: string
  callsign: string
  created_at: string
  is_active: boolean
}

type Stats = {
  users: number
  activations: number
  qsos: number
}

type SortOrder = 'newest' | 'alpha'

export default function AdminPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [stats, setStats] = useState<Stats>({ users: 0, activations: 0, qsos: 0 })
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [emailStatus, setEmailStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'users' | 'email' | 'activations'>('users')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [search, setSearch] = useState('')
  const [soloTarget, setSoloTarget] = useState<Profile | null>(null)
  const [soloSubject, setSoloSubject] = useState('')
  const [soloBody, setSoloBody] = useState('')
  const [soloStatus, setSoloStatus] = useState('')
  const composeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.user_metadata?.callsign?.toUpperCase() !== 'WW1ZRD') {
        router.push('/')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      const { count: actCount } = await supabase
        .from('activations')
        .select('*', { count: 'exact', head: true })

      const { count: qsoCount } = await supabase
        .from('qsos')
        .select('*', { count: 'exact', head: true })

      setProfiles(profileData ?? [])
      setStats({
        users: profileData?.length ?? 0,
        activations: actCount ?? 0,
        qsos: qsoCount ?? 0,
      })
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (soloTarget && composeRef.current) {
      setTimeout(() => {
        composeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    }
  }, [soloTarget])

  async function deleteUser(id: string, callsign: string) {
    if (!confirm(`Delete ${callsign}? This cannot be undone.`)) return
    const res = await fetch('/api/admin/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: id }),
    })
    if (res.ok) {
      setProfiles(p => p.filter(u => u.id !== id))
    } else {
      alert('Delete failed.')
    }
  }

  async function sendEmail() {
    if (!emailSubject.trim() || !emailBody.trim()) {
      setEmailStatus('Subject and body are required.')
      return
    }
    setEmailStatus('Sending...')
    const res = await fetch('/api/admin/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: emailSubject, body: emailBody }),
    })
    if (res.ok) {
      setEmailStatus(`Email sent to ${profiles.length} members.`)
      setEmailSubject('')
      setEmailBody('')
    } else {
      setEmailStatus('Failed to send. Check the API route.')
    }
  }

  async function sendSoloEmail() {
    if (!soloTarget) return
    if (!soloSubject.trim() || !soloBody.trim()) {
      setSoloStatus('Subject and body are required.')
      return
    }
    setSoloStatus('Sending...')
    const res = await fetch('/api/admin/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: soloSubject,
        body: soloBody,
        userId: soloTarget.id,
      }),
    })
    if (res.ok) {
      setSoloStatus(`Email sent to ${soloTarget.callsign}.`)
      setSoloSubject('')
      setSoloBody('')
    } else {
      setSoloStatus('Failed to send.')
    }
  }

  const filteredAndSortedProfiles = [...profiles]
    .filter(p => p.callsign.toUpperCase().includes(search.toUpperCase()))
    .sort((a, b) => {
      if (sortOrder === 'alpha') return a.callsign.localeCompare(b.callsign)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  const tabStyle = (t: string) => ({
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const,
    padding: '0.5rem 1.25rem', cursor: 'pointer', border: 'none',
    background: tab === t ? 'var(--amber)' : 'transparent',
    color: tab === t ? '#0a0e14' : 'var(--text-dim)',
    borderBottom: tab === t ? 'none' : '0.5px solid var(--border)',
  })

  const sortBtnStyle = (s: SortOrder) => ({
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const,
    padding: '0.3rem 0.85rem', cursor: 'pointer',
    border: '0.5px solid',
    borderColor: sortOrder === s ? 'var(--amber)' : 'var(--border)',
    color: sortOrder === s ? 'var(--amber)' : 'var(--text-dim)',
    background: 'transparent',
  })

  if (loading) return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <Nav />
      <section style={{ padding: '5rem 2rem', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--text-dim)' }}>
        Loading...
      </section>
      <Footer />
    </main>
  )

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <Nav />
      <section style={{ padding: '5rem 2rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>

        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ display: 'inline-block', width: '2rem', height: '0.5px', background: 'var(--amber)' }} />
          Admin — WW1ZRD
        </p>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 700, color: 'var(--text)', marginBottom: '2rem' }}>
          OOTA Control Center
        </h1>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Operators', val: stats.users },
            { label: 'Activations', val: stats.activations },
            { label: 'QSOs', val: stats.qsos },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, minWidth: '140px', border: '0.5px solid var(--border)', padding: '1.25rem', textAlign: 'center' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.5rem', fontWeight: 500, color: 'var(--amber)', display: 'block' }}>{s.val}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', marginBottom: '0' }}>
          <button style={tabStyle('users')} onClick={() => setTab('users')}>Users</button>
          <button style={tabStyle('activations')} onClick={() => setTab('activations')}>Activations</button>
          <button style={tabStyle('email')} onClick={() => setTab('email')}>Email Members</button>
        </div>

        <div style={{ border: '0.5px solid var(--border)', padding: '1.5rem' }}>

          {/* Users tab */}
          {tab === 'users' && (
            <>
              {/* Search + Sort controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Search callsign…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.7rem', letterSpacing: '0.08em',
                    padding: '0.35rem 0.85rem',
                    border: '0.5px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--text)',
                    outline: 'none',
                    width: '180px',
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Sort:</span>
                  <button style={sortBtnStyle('newest')} onClick={() => setSortOrder('newest')}>Newest First</button>
                  <button style={sortBtnStyle('alpha')} onClick={() => setSortOrder('alpha')}>A → Z</button>
                </div>
                {search && (
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', color: 'var(--amber)' }}>
                    {filteredAndSortedProfiles.length} result{filteredAndSortedProfiles.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem' }}>
                <thead>
                  <tr style={{ borderBottom: '0.5px solid var(--border)' }}>
                    {['Callsign', 'Joined', 'Active', 'Actions'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.6rem' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedProfiles.map(p => (
                    <tr key={p.id} style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '0.6rem 0.75rem', color: 'var(--amber)' }}>{p.callsign}</td>
                      <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-dim)' }}>{new Date(p.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '0.6rem 0.75rem', color: p.is_active ? '#4caf50' : '#ff6b6b' }}>{p.is_active ? 'Yes' : 'No'}</td>
                      <td style={{ padding: '0.6rem 0.75rem' }}>
                        <button
                          onClick={() => {
                            setSoloTarget(p)
                            setSoloStatus('')
                            setSoloSubject('')
                            setSoloBody('')
                          }}
                          style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', background: 'transparent', border: '0.5px solid var(--amber)', color: 'var(--amber)', padding: '0.25rem 0.75rem', cursor: 'pointer', letterSpacing: '0.08em', marginRight: '0.5rem' }}>
                          Email
                        </button>
                        {p.callsign !== 'WW1ZRD' && (
                          <button
                            onClick={() => deleteUser(p.id, p.callsign)}
                            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', background: 'transparent', border: '0.5px solid #ff6b6b', color: '#ff6b6b', padding: '0.25rem 0.75rem', cursor: 'pointer', letterSpacing: '0.08em' }}>
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredAndSortedProfiles.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: '2rem 0.75rem', color: 'var(--text-dim)', textAlign: 'center' }}>
                        No callsigns match "{search}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Solo email compose panel */}
              {soloTarget && (
                <div ref={composeRef} style={{ marginTop: '2rem', border: '0.5px solid var(--amber)', padding: '1.5rem' }}>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '1rem' }}>
                    Email → {soloTarget.callsign}
                    <button
                      onClick={() => setSoloTarget(null)}
                      style={{ float: 'right', background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem' }}>
                      ✕ Close
                    </button>
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem' }}>Subject</label>
                      <input type="text" value={soloSubject} onChange={e => setSoloSubject(e.target.value)}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)', color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', padding: '0.85rem 1rem', outline: 'none', boxSizing: 'border-box' as const }} />
                    </div>
                    <div>
                      <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem' }}>Message</label>
                      <textarea value={soloBody} onChange={e => setSoloBody(e.target.value)} rows={6}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)', color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', padding: '0.85rem 1rem', outline: 'none', boxSizing: 'border-box' as const, resize: 'vertical' }} />
                    </div>
                    {soloStatus && (
                      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: soloStatus.includes('sent') ? '#4caf50' : '#ff6b6b', border: `0.5px solid ${soloStatus.includes('sent') ? '#4caf50' : '#ff6b6b'}`, padding: '0.75rem 1rem' }}>
                        {soloStatus}
                      </p>
                    )}
                    <button onClick={sendSoloEmail}
                      style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'var(--amber)', color: '#0a0e14', border: 'none', padding: '0.85rem 2rem', cursor: 'pointer' }}>
                      Send to {soloTarget.callsign}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Activations tab */}
          {tab === 'activations' && (
            <ActivationsTab />
          )}

          {/* Email tab */}
          {tab === 'email' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '600px' }}>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--text-dim)', lineHeight: 1.7 }}>
                Send an email to all <strong style={{ color: 'var(--amber)' }}>{profiles.length}</strong> registered operators.
              </p>
              <div>
                <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem' }}>Subject</label>
                <input type="text" value={emailSubject} onChange={e => setEmailSubject(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)', color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', padding: '0.85rem 1rem', outline: 'none', boxSizing: 'border-box' as const }} />
              </div>
              <div>
                <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem' }}>Message</label>
                <textarea value={emailBody} onChange={e => setEmailBody(e.target.value)} rows={8}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--border)', color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', padding: '0.85rem 1rem', outline: 'none', boxSizing: 'border-box' as const, resize: 'vertical' }} />
              </div>
              {emailStatus && (
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: emailStatus.includes('sent') ? '#4caf50' : '#ff6b6b', border: `0.5px solid ${emailStatus.includes('sent') ? '#4caf50' : '#ff6b6b'}`, padding: '0.75rem 1rem' }}>
                  {emailStatus}
                </p>
              )}
              <button onClick={sendEmail}
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'var(--amber)', color: '#0a0e14', border: 'none', padding: '1rem 2rem', cursor: 'pointer', width: '100%' }}>
                Send to All Members
              </button>
            </div>
          )}

        </div>
      </section>
      <Footer />
    </main>
  )
}

function ActivationsTab() {
  const [activations, setActivations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('activations')
        .select('id, callsign, location_desc, band, qso_count, activation_date')
        .order('activation_date', { ascending: false })
        .limit(100)
      setActivations(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--text-dim)' }}>Loading...</p>

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem' }}>
      <thead>
        <tr style={{ borderBottom: '0.5px solid var(--border)' }}>
          {['Callsign', 'Location', 'Band', 'QSOs', 'Date'].map(h => (
            <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.6rem' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {activations.map(a => (
          <tr key={a.id} style={{ borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
            <td style={{ padding: '0.6rem 0.75rem', color: 'var(--amber)' }}>{a.callsign}</td>
            <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-dim)' }}>{a.location_desc ?? '—'}</td>
            <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-dim)' }}>{a.band ?? '—'}</td>
            <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text)' }}>{a.qso_count ?? 0}</td>
            <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-dim)' }}>{new Date(a.activation_date).toLocaleDateString()}</td>
          </tr>
        ))}
        {activations.length === 0 && (
          <tr>
            <td colSpan={5} style={{ padding: '2rem 0.75rem', color: 'var(--text-dim)', textAlign: 'center' }}>
              No activations yet.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )
}
