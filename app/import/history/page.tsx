'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

interface ImportResultRow {
  date:    string
  outcome: 'success' | 'skipped' | 'failed'
  detail:  string
}

interface ImportBatch {
  id:                 string
  created_at:         string
  file_name:          string | null
  qsos_found:         number
  activations_found:  number
  imported_count:     number
  skipped_count:      number
  failed_count:       number
  results:            ImportResultRow[] | null
}

export default function ImportHistoryPage() {
  const [authReady, setAuthReady] = useState(false)
  const [loading, setLoading]     = useState(true)
  const [batches, setBatches]     = useState<ImportBatch[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg]   = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        window.location.href = '/login'
        return
      }
      setAuthReady(true)

      const { data: rows, error } = await supabase
        .from('import_batches')
        .select('id, created_at, file_name, qsos_found, activations_found, imported_count, skipped_count, failed_count, results')
        .eq('user_id', data.session.user.id)
        .order('created_at', { ascending: false })

      if (error) {
        setErrorMsg(error.message)
      } else {
        setBatches(rows ?? [])
      }
      setLoading(false)
    })
  }, [])

  function formatDate(iso: string) {
    const d = new Date(iso)
    return d.toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  if (!authReady) {
    return (
      <main style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
        <Nav />
        <section style={{ padding: '8rem 2rem', textAlign: 'center' }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--text-dim)' }}>
            Checking session…
          </p>
        </section>
        <Footer />
      </main>
    )
  }

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <Nav />

      <section style={{ padding: '5rem 2rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ display: 'inline-block', width: '2rem', height: '0.5px', background: 'var(--amber)' }} />
            Import History
          </p>
          <a href="/import" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--amber)', textDecoration: 'none', border: '0.5px solid var(--amber)', padding: '0.5rem 1rem' }}>
            New Import
          </a>
        </div>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, lineHeight: 1.1, color: 'var(--text)', marginBottom: '1rem' }}>
          What you've<br />
          <em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>brought in.</em>
        </h1>

        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', lineHeight: 1.8, color: 'var(--text-dim)', marginBottom: '2.5rem' }}>
          Every ADIF import you've run, most recent first. Only imports made after import history was added will appear here.
        </p>

        {loading && (
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Loading…
          </p>
        )}

        {errorMsg && (
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', color: '#ff6b6b', marginBottom: '1rem' }}>
            {errorMsg}
          </p>
        )}

        {!loading && !errorMsg && batches.length === 0 && (
          <div style={{ border: '0.5px dashed var(--border)', padding: '3rem 2rem', textAlign: 'center' }}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--text-dim)' }}>
              No imports yet.
            </p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {batches.map(batch => {
            const isExpanded = expandedId === batch.id
            const nonSuccess = (batch.results ?? []).filter(r => r.outcome !== 'success')

            return (
              <div key={batch.id} style={{ border: '0.5px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : batch.id)}
                  style={{
                    width: '100%', textAlign: 'left', cursor: 'pointer',
                    background: 'transparent', border: 'none', color: 'var(--text)',
                    padding: '1rem 1.25rem',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    flexWrap: 'wrap', gap: '0.75rem',
                  }}
                >
                  <div>
                    <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '0.35rem' }}>
                      {formatDate(batch.created_at)}
                    </p>
                    <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: 'var(--amber)' }}>
                      {batch.file_name || 'Untitled file'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '1.25rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem' }}>
                    <span style={{ color: 'var(--text)' }}>{batch.imported_count} imported</span>
                    {batch.skipped_count > 0 && <span style={{ color: 'var(--text-dim)' }}>{batch.skipped_count} skipped</span>}
                    {batch.failed_count > 0  && <span style={{ color: '#ff6b6b' }}>{batch.failed_count} failed</span>}
                    <span style={{ color: 'var(--text-dim)', opacity: 0.6 }}>{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </button>

                {isExpanded && (
                  <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '0.5px solid var(--border)' }}>
                    <div style={{ display: 'flex', gap: '2rem', padding: '1rem 0', flexWrap: 'wrap' }}>
                      {[
                        ['Activations found', batch.activations_found],
                        ['QSOs found', batch.qsos_found],
                      ].map(([label, value]) => (
                        <div key={label as string}>
                          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, color: 'var(--amber)' }}>{value}</div>
                          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.55rem', color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</div>
                        </div>
                      ))}
                    </div>

                    {nonSuccess.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {nonSuccess.map((r, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '1rem', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', lineHeight: 1.6 }}>
                            <span style={{ color: r.outcome === 'failed' ? '#ff6b6b' : 'var(--text-dim)', minWidth: '90px' }}>{r.date}</span>
                            <span style={{ color: r.outcome === 'failed' ? '#ff6b6b' : 'var(--text-dim)' }}>{r.detail}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: 'var(--text-dim)', opacity: 0.7 }}>
                        Every activation in this import succeeded.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <Footer />
    </main>
  )
}
