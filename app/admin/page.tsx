'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

type Profile = {
  id: string
  callsign: string
  email?: string
  created_at: string
  is_active: boolean
}

type Stats = {
  users: number
  activations: number
  qsos: number
}

export default function AdminPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [stats, setStats] = useState<Stats>({ users: 0, activations: 0, qsos: 0 })
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [emailStatus, setEmailStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'users' | 'email' | 'activations'>('users')

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

  const tabStyle = (t: string) => ({
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const,
    padding: '0.5rem 1.25rem', cursor: 'pointer', border: 'none',
    background: tab === t ? 'var(--amber)' : 'transparent',
    color: tab === t ? '#0a0e14' : 'var(--text-dim)',
    borderBottom: tab === t ? 'none' : '0.5px solid var(--border)',
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

        <div style={{ border: '0.5px solid var(
