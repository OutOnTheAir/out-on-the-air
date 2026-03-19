'use client'

// ============================================================
// app/awards/page.tsx
// Client component — fetches, evaluates, and persists awards
// ============================================================

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { evaluateAwards, type EvaluatedAward } from '@/lib/awards'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import AwardsClient from './AwardsClient'

async function persistEarnedAwards(userId: string, results: EvaluatedAward[]) {
  const earned = results.filter(r => r.earned)
  if (earned.length === 0) return

  // Get all award definition IDs by slug in one query
  const slugs = earned.map(r => r.award.slug)
  const { data: defs, error: defError } = await supabase
    .from('award_definitions')
    .select('id, slug')
    .in('slug', slugs)

  if (defError || !defs?.length) return

  const slugToId = Object.fromEntries(defs.map(d => [d.slug, d.id]))

  // Upsert earned awards — won't duplicate thanks to unique constraint
  const rows = earned
    .filter(r => slugToId[r.award.slug])
    .map(r => ({
      user_id:   userId,
      award_id:  slugToId[r.award.slug],
      earned_at: new Date().toISOString(),
    }))

  if (rows.length === 0) return

  await supabase
    .from('user_awards')
    .upsert(rows, { onConflict: 'user_id,award_id', ignoreDuplicates: true })
}

export default function AwardsPage() {
  const [results, setResults] = useState<EvaluatedAward[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

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
        // Persist in background — don't block the UI
        persistEarnedAwards(user.id, evaluated).catch(console.error)
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
