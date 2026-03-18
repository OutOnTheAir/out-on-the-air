// ============================================================
// lib/cert/certStyles.ts
// Three cert style definitions for @react-pdf/renderer
// ============================================================

export type CertStyleKey = 'dark' | 'modern' | 'retro'

export interface CertStyleDef {
  key: CertStyleKey
  label: string
  description: string
}

export const CERT_STYLES: CertStyleDef[] = [
  { key: 'dark',   label: 'Dark Parchment',  description: 'Midnight gold — OOTA signature style' },
  { key: 'modern', label: 'Modern Minimal',  description: 'Clean white with indigo accent' },
  { key: 'retro',  label: 'Retro Official',  description: 'Classic ham radio certificate look' },
]
