'use client'
// ============================================================
// app/awards/page.tsx
// Public-facing — logged out users see all awards as preview
// Logged in users see earned/unearned status + persistence
// ============================================================
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { evaluateAwards, AWARD_DEFINITIONS, type EvaluatedAward, type AwardCategory } from '@/lib/awards'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import AwardsClient from './AwardsClient'
import Link from 'next/link'

async function persistEarnedAwards(userId: string, results: EvaluatedAward[]) {
  const earned = results.filter(r => r.earned)
  if (earned.length === 0) return
  const slugs = earned.map(r => r.award.slug)
  const { data: defs, error: defError } = await supabase
    .from('award_definitions')
    .select('id, slug')
    .in('slug', slugs)
  if (defError || !defs?.length) return
  const slugToId = Object.fromEntries(defs.map(d => [d.slug, d.id]))
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

async function fetchAllAwardsAsPreview(): Promise<EvaluatedAward[]> {
  const { data: defs } = await supabase
    .from('award_definitions')
    .select('*')
    .eq('is_active', true)

  if (!defs) return []

  return defs.map(def => {
    const localDef = AWARD_DEFINITIONS.find(a => a.slug === def.slug)
    return {
      award: localDef ?? {
        slug:        def.slug,
        name:        def.name,
        description: def.description,
        category:    def.type as AwardCategory,
      },
      earned:   false,
      progress: 0,
      current:  0,
      required: def.trigger_value ?? 1,
    }
  })
}

export default function AwardsPage() {
  const [results, setResults]   = useState<EvaluatedAward[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // Public preview — show all awards as unearned
        try {
          const preview = await fetchAllAwardsAsPreview()
          setResults(preview)
          setLoggedIn(false)
        } catch (e: unknown) {
          setError(e instanceof Error ? e.message : 'Failed to load awards')
        } finally {
          setLoading(false)
        }
        return
      }

      // Logged in — evaluate real earned status
      setLoggedIn(true)
      try {
        const evaluated = await evaluateAwards(user.id)
        setResults(evaluated)
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

      {/* Sign-up CTA banner for logged-out visitors */}
      {!loading && !loggedIn && (
        <div style={{
          background: 'rgba(201,168,76,0.07)',
          borderBottom: '0.5px solid rgba(201,168,76,0.2)',
          padding: '1rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.7rem',
            letterSpacing: '0.08em',
            color: 'var(--text-dim)',
            margin: 0,
          }}>
            <span style={{ color: 'var(--amber)' }}>{results.length} awards</span> to earn — create a free account to start tracking your progress.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link href="/login" style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.65rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--text-dim)',
              textDecoration: 'none',
            }}>
              Sign In
            </Link>
            <Link href="/register" style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.65rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--amber)',
              border: '0.5px solid var(--amber)',
              padding: '0.5rem 1.25rem',
              textDecoration: 'none',
            }}>
              Get Started →
            </Link>
          </div>
        </div>
      )}

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
