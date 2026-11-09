'use client'

import { useState, useMemo } from 'react'
import { DXCC_ENTITIES, dxccName } from '@/lib/dxcc'

// ============================================================
// Searchable multi-select for DXCC entities ("countries worked").
// Value is an array of ADIF DXCC entity code strings.
// ============================================================

interface Props {
  value:    string[]
  onChange: (codes: string[]) => void
  disabled?: boolean
}

const MAX_RESULTS = 8

const chipStyle = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.6rem',
  letterSpacing: '0.05em',
  padding: '0.25rem 0.5rem',
  border: '0.5px solid var(--amber)',
  color: 'var(--amber)',
  background: 'rgba(212,175,55,0.08)',
  cursor: 'pointer',
} as const

export default function CountryPicker({ value, onChange, disabled }: Props) {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const selected = new Set(value)
    return DXCC_ENTITIES
      .filter(e => !selected.has(e.code) &&
        (e.name.toLowerCase().includes(q) || e.code === q))
      .slice(0, MAX_RESULTS)
  }, [query, value])

  function add(code: string) {
    if (!value.includes(code)) onChange([...value, code])
    setQuery('')
  }

  function remove(code: string) {
    onChange(value.filter(c => c !== code))
  }

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Type a country name, e.g. Germany, Japan, Canada"
        disabled={disabled}
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.03)',
          border: '0.5px solid var(--border)',
          color: 'var(--text)',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.85rem',
          padding: '0.85rem 1rem',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />

      {query.trim() !== '' && (
        <div style={{
          border: '0.5px solid var(--border)', borderTop: 'none',
          background: '#0a0e14',
        }}>
          {results.length === 0 ? (
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: 'var(--text-dim)', padding: '0.6rem 0.85rem' }}>
              No matching country.
            </p>
          ) : results.map(e => (
            <button
              key={e.code}
              type="button"
              onClick={() => add(e.code)}
              disabled={disabled}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.7rem', color: 'var(--text)',
                background: 'transparent', border: 'none',
                borderBottom: '0.5px solid var(--border)',
                padding: '0.55rem 0.85rem', cursor: 'pointer',
              }}
            >
              {e.name}
            </button>
          ))}
        </div>
      )}

      {value.length > 0 && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '0.35rem',
          padding: '0.75rem', marginTop: '0.5rem',
          border: '0.5px solid var(--border)',
          background: 'rgba(255,255,255,0.02)',
        }}>
          {value.map(code => (
            <button
              key={code}
              type="button"
              onClick={() => remove(code)}
              disabled={disabled}
              title="Click to remove"
              style={chipStyle}
            >
              {dxccName(code)} ×
            </button>
          ))}
        </div>
      )}

      {value.length > 0 && (
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.58rem', color: 'var(--amber)', marginTop: '0.4rem' }}>
          {value.length} countr{value.length !== 1 ? 'ies' : 'y'} selected
        </p>
      )}
    </div>
  )
}
