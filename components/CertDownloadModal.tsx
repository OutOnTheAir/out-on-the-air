'use client'

// ============================================================
// components/CertDownloadModal.tsx
// Style picker modal — user chooses Dark / Modern / Retro
// then triggers PDF download
// ============================================================

import { useState } from 'react'
import { type EvaluatedAward } from '@/lib/awards'
import { CERT_STYLES, type CertStyleKey } from '@/lib/cert/certStyles'
import { generateCert } from '@/lib/cert/generateCert'

interface Props {
  result: EvaluatedAward
  onClose: () => void
}

const STYLE_PREVIEWS: Record<CertStyleKey, {
  bg: string
  border: string
  titleColor: string
  callsignColor: string
  descColor: string
  footerColor: string
  accent: string
}> = {
  dark: {
    bg: '#130a04',
    border: '#8a6a3a',
    titleColor: '#e8d5a3',
    callsignColor: '#c9a84c',
    descColor: '#8a9a7a',
    footerColor: '#5a4a2a',
    accent: '#c9a84c',
  },
  modern: {
    bg: '#ffffff',
    border: '#e5e5e5',
    titleColor: '#111111',
    callsignColor: '#2a1acc',
    descColor: '#555555',
    footerColor: '#999999',
    accent: '#4a3aff',
  },
  retro: {
    bg: '#f5f0e8',
    border: '#1a3a5c',
    titleColor: '#1a3a5c',
    callsignColor: '#1a3a5c',
    descColor: '#4a6a8c',
    footerColor: '#4a6a8c',
    accent: '#1a3a5c',
  },
}

function MiniCert({
  styleKey,
  awardName,
  selected,
  onClick,
}: {
  styleKey: CertStyleKey
  awardName: string
  selected: boolean
  onClick: () => void
}) {
  const p = STYLE_PREVIEWS[styleKey]
  const label = CERT_STYLES.find(s => s.key === styleKey)!

  return (
    <button
      onClick={onClick}
      style={{
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        flex: '1 1 0',
        minWidth: 0,
      }}
    >
      {/* Mini cert preview */}
      <div style={{
        background: p.bg,
        border: `${selected ? '2px' : '1px'} solid ${selected ? p.accent : p.border}`,
        borderRadius: '4px',
        padding: '12px 10px',
        transition: 'border 0.15s',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Top accent */}
        {styleKey === 'modern' && (
          <div style={{ height: '3px', background: p.accent, marginBottom: '8px', borderRadius: '1px' }} />
        )}
        <div style={{
          fontFamily: 'monospace',
          fontSize: '7px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: p.accent,
          marginBottom: '4px',
          opacity: 0.8,
        }}>
          Out on the Air
        </div>
        <div style={{
          fontSize: '9px',
          fontWeight: 'bold',
          color: p.titleColor,
          marginBottom: '6px',
          lineHeight: 1.2,
        }}>
          {awardName}
        </div>
        <div style={{
          fontSize: '13px',
          fontWeight: 'bold',
          color: p.callsignColor,
          fontFamily: 'monospace',
          letterSpacing: '1px',
        }}>
          WW1ZRD
        </div>
        <div style={{
          marginTop: '8px',
          borderTop: `0.5px solid ${p.border}`,
          paddingTop: '6px',
          fontSize: '6px',
          color: p.footerColor,
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <span>outontheair.com</span>
          <span>{new Date().getFullYear()}</span>
        </div>
        {selected && (
          <div style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: p.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '8px',
            color: styleKey === 'dark' ? '#130a04' : '#ffffff',
          }}>
            ✓
          </div>
        )}
      </div>

      {/* Label */}
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.65rem',
          fontWeight: selected ? 600 : 400,
          color: selected ? 'var(--text)' : 'var(--text-dim)',
          margin: 0,
        }}>
          {label.label}
        </p>
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.55rem',
          color: 'var(--text-dim)',
          margin: '2px 0 0',
          opacity: 0.7,
        }}>
          {label.description}
        </p>
      </div>
    </button>
  )
}

export default function CertDownloadModal({ result, onClose }: Props) {
  const [selected, setSelected] = useState<CertStyleKey>('dark')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function handleDownload() {
    setLoading(true)
    setError(null)
    try {
      const { buffer, filename } = await generateCert(result, selected)
      // Decode base64 and trigger download
      const bytes = Uint8Array.from(atob(buffer), c => c.charCodeAt(0))
      const blob  = new Blob([bytes], { type: 'application/pdf' })
      const url   = URL.createObjectURL(blob)
      const a     = document.createElement('a')
      a.href      = url
      a.download  = filename
      a.click()
      URL.revokeObjectURL(url)
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to generate certificate')
    } finally {
      setLoading(false)
    }
  }

  return (
    // Backdrop
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.7)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      {/* Modal */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg)',
          border: '0.5px solid var(--border)',
          maxWidth: '560px',
          width: '100%',
          padding: '2rem',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.6rem', letterSpacing: '0.2em',
            textTransform: 'uppercase', color: 'var(--amber)',
            marginBottom: '0.5rem',
          }}>
            Download Certificate
          </p>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.4rem', fontWeight: 700,
            color: 'var(--text)', margin: 0,
          }}>
            {result.award.name}
          </h2>
        </div>

        {/* Style picker */}
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.65rem', color: 'var(--text-dim)',
          marginBottom: '1rem',
        }}>
          Choose your certificate style:
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem' }}>
          {CERT_STYLES.map(s => (
            <MiniCert
              key={s.key}
              styleKey={s.key}
              awardName={result.award.name}
              selected={selected === s.key}
              onClick={() => setSelected(s.key)}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.65rem', color: '#e05c5c',
            marginBottom: '1rem',
          }}>
            {error}
          </p>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.65rem', letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--text-dim)',
              background: 'transparent',
              border: '0.5px solid var(--border)',
              padding: '0.6rem 1.2rem',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={loading}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.65rem', letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: loading ? 'var(--text-dim)' : '#130a04',
              background: loading ? 'rgba(212,175,55,0.3)' : 'var(--amber)',
              border: '0.5px solid var(--amber)',
              padding: '0.6rem 1.5rem',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  )
}
