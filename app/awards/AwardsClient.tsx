'use client'

// ============================================================
// AwardsClient.tsx
// Client component — renders the awards grid, handles cert download
// ============================================================

import { useState } from 'react'
import { type EvaluatedAward, type AwardCategory } from '@/lib/awards'
import CertDownloadModal from '@/components/CertDownloadModal'

const CATEGORY_LABELS: Record<AwardCategory, string> = {
  milestone: 'Activation Milestones',
  band:      'Band Endorsements',
  mode:      'Mode Endorsements',
  grid:      'Grid Awards',
  dxcc:      'DXCC Entity Awards',
  special:   'Special & Seasonal',
  satellite: 'Out of This World',
}

const CATEGORY_ORDER: AwardCategory[] = ['milestone', 'band', 'mode', 'grid', 'dxcc', 'special', 'satellite']

interface Props {
  results: EvaluatedAward[]
  earnedCount: number
  totalCount: number
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase',
      color: 'var(--amber)', marginBottom: '2rem',
      display: 'flex', alignItems: 'center', gap: '0.75rem',
    }}>
      <span style={{ display: 'inline-block', width: '2rem', height: '0.5px', background: 'var(--amber)' }} />
      {children}
    </p>
  )
}

function Divider() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem' }}>
      <div style={{ height: '0.5px', background: 'var(--border)' }} />
    </div>
  )
}

function ProgressBar({ progress, earned }: { progress: number; earned: boolean }) {
  return (
    <div style={{
      height: '2px',
      background: 'rgba(255,255,255,0.06)',
      borderRadius: '1px',
      overflow: 'hidden',
      marginTop: '0.75rem',
    }}>
      <div style={{
        height: '100%',
        width: `${progress}%`,
        background: earned ? 'var(--amber)' : 'rgba(212,175,55,0.35)',
        borderRadius: '1px',
        transition: 'width 0.6s ease',
      }} />
    </div>
  )
}

function AwardCard({
  result,
  onDownload,
}: {
  result: EvaluatedAward
  onDownload: (result: EvaluatedAward) => void
}) {
  const { award, earned, progress, current, required } = result
  const isBoolean = required === 1

  return (
    <div style={{
      padding: '1.25rem 1.5rem',
      background: earned ? 'rgba(212,175,55,0.04)' : 'rgba(255,255,255,0.02)',
      border: `0.5px solid ${earned ? 'rgba(212,175,55,0.3)' : 'var(--border)'}`,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
      position: 'relative',
    }}>
      {/* Earned indicator */}
      {earned && (
        <div style={{
          position: 'absolute', top: '1rem', right: '1rem',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.55rem', letterSpacing: '0.15em',
          textTransform: 'uppercase', color: 'var(--amber)',
        }}>
          ✦ earned
        </div>
      )}

      {/* Category tag for special */}
      {award.category === 'special' && (
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.55rem', letterSpacing: '0.15em',
          textTransform: 'uppercase', color: 'var(--amber)', opacity: 0.6,
          marginBottom: '0.25rem',
        }}>Special</p>
      )}

      {/* Name */}
      <p style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '1.05rem', fontWeight: 600,
        color: earned ? 'var(--text)' : 'var(--text-dim)',
        marginBottom: '0.25rem',
        paddingRight: earned ? '4rem' : '0',
      }}>
        {award.name}
      </p>

      {/* Threshold / description */}
      {award.threshold && (
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.65rem', letterSpacing: '0.08em',
          color: 'var(--amber)', opacity: earned ? 1 : 0.5,
        }}>
          {award.threshold}
        </p>
      )}

      <p style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.68rem', lineHeight: 1.5,
        color: 'var(--text-dim)',
        marginTop: '0.25rem',
      }}>
        {award.description}
      </p>

      {/* Progress bar + label for countable awards */}
      {!isBoolean && (
        <>
          <ProgressBar progress={progress} earned={earned} />
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.6rem', color: 'var(--text-dim)',
            marginTop: '0.4rem', textAlign: 'right',
          }}>
            {current.toLocaleString()} / {required.toLocaleString()}
          </p>
        </>
      )}

      {/* Download cert button */}
      {earned && (
        <button
          onClick={() => onDownload(result)}
          style={{
            marginTop: '0.75rem',
            alignSelf: 'flex-start',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.6rem', letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--amber)',
            background: 'transparent',
            border: '0.5px solid rgba(212,175,55,0.4)',
            padding: '0.4rem 0.85rem',
            cursor: 'pointer',
          }}
        >
          Download Certificate
        </button>
      )}
    </div>
  )
}

export default function AwardsClient({ results, earnedCount, totalCount }: Props) {
  const [certTarget, setCertTarget] = useState<EvaluatedAward | null>(null)

  const byCategory = CATEGORY_ORDER.reduce((acc, cat) => {
    acc[cat] = results.filter(r => r.award.category === cat)
    return acc
  }, {} as Record<AwardCategory, EvaluatedAward[]>)

  return (
    <>
      {/* Hero */}
      <section style={{ padding: '5rem 2rem 3rem', maxWidth: '900px', margin: '0 auto' }}>
        <SectionLabel>Awards</SectionLabel>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: 700, lineHeight: 1.1,
          color: 'var(--text)', marginBottom: '1.5rem',
        }}>
          Earned in the field.<br />
          <em style={{ color: 'var(--amber)', fontStyle: 'italic' }}>Never handed out.</em>
        </h1>
        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.15rem', lineHeight: 1.8,
          color: 'var(--text-dim)', maxWidth: '600px',
        }}>
          OOTA awards recognize real operating — activations logged away from home,
          contacts made voice or fist, bands worked, grids crossed, and entities reached.
          28 awards at launch. All free. All earned.
        </p>

        {/* Earned summary */}
        <div style={{
          marginTop: '2rem',
          display: 'inline-flex', alignItems: 'center', gap: '1rem',
          padding: '0.75rem 1.25rem',
          border: '0.5px solid var(--border)',
          background: 'rgba(255,255,255,0.02)',
        }}>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.75rem', fontWeight: 700,
            color: 'var(--amber)',
          }}>{earnedCount}</span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.7rem', color: 'var(--text-dim)', lineHeight: 1.4,
          }}>
            of {totalCount} awards<br />earned
          </span>
        </div>
      </section>

      <Divider />

      {/* Award sections by category */}
      {CATEGORY_ORDER.map((cat, i) => {
        const catResults = byCategory[cat]
        if (!catResults?.length) return null

        const isBand = cat === 'band'

        return (
          <div key={cat}>
            <section style={{ padding: '3rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
              <SectionLabel>{CATEGORY_LABELS[cat]}</SectionLabel>

              {/* Band endorsements — pill layout */}
              {isBand ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {catResults.map(r => (
                    <div key={r.award.slug} style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em',
                      color: r.earned ? 'var(--amber)' : 'var(--text-dim)',
                      border: `0.5px solid ${r.earned ? 'var(--amber)' : 'var(--border)'}`,
                      padding: '0.5rem 1rem',
                      opacity: r.earned ? 1 : 0.4,
                      position: 'relative',
                    }}>
                      {r.award.name}
                      {r.earned && (
                        <span style={{ marginLeft: '0.4rem', fontSize: '0.5rem' }}>✦</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: cat === 'milestone' ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '0.75rem',
                }}>
                  {catResults.map(r => (
                    <AwardCard
                      key={r.award.slug}
                      result={r}
                      onDownload={setCertTarget}
                    />
                  ))}
                </div>
              )}

              {/* Band cert download — separate row below pills */}
              {isBand && catResults.some(r => r.earned) && (
                <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {catResults.filter(r => r.earned).map(r => (
                    <button
                      key={r.award.slug}
                      onClick={() => setCertTarget(r)}
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.6rem', letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--amber)',
                        background: 'transparent',
                        border: '0.5px solid rgba(212,175,55,0.4)',
                        padding: '0.4rem 0.85rem',
                        cursor: 'pointer',
                      }}
                    >
                      {r.award.name} certificate
                    </button>
                  ))}
                </div>
              )}
            </section>

            {i < CATEGORY_ORDER.length - 1 && <Divider />}
          </div>
        )
      })}

      {/* Cert download modal */}
      {certTarget && (
        <CertDownloadModal
          result={certTarget}
          onClose={() => setCertTarget(null)}
        />
      )}
    </>
  )
}
