'use client'

// ============================================================
// app/awards/page.tsx
// Client component — fetches and evaluates awards for logged-in user
// ============================================================

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { evaluateAwards, type EvaluatedAward } from '@/lib/awards'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import AwardsClient from './AwardsClient'

export default function AwardsPage() {
  const [results, setResults]       = useState<EvaluatedAward[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }
      try {
        const evaluated = await evaluateAwards(user.id)
        setResults(evaluated)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load awards')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const earned = results.filter(r => r.earned).length

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <Nav />
      {loading && (
        <div style={{
          padding: '8rem 2rem',
          textAlign: 'center',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.75rem',
          color: 'var(--text-dim)',
          letterSpacing: '0.15em',
        }}>
          Loading awards...
        </div>
      )}
      {error && (
        <div style={{
          padding: '8rem 2rem',
          textAlign: 'center',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.75rem',
          color: '#e05c5c',
        }}>
          {error}
        </div>
      )}
      {!loading && !error && (
        <AwardsClient results={results} earnedCount={earned} totalCount={results.length} />
      )}
      <Footer />
    </main>
  )
}
