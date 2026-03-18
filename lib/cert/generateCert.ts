'use server'

// ============================================================
// lib/cert/generateCert.ts
// Server action — renders PDF and returns base64 for download
// ============================================================

import { renderToBuffer } from '@react-pdf/renderer'
import { supabase } from '@/lib/supabase'
import CertDocument from './CertDocument'
import { type EvaluatedAward } from '@/lib/awards'
import { type CertStyleKey } from './certStyles'
import React from 'react'

export async function generateCert(
  award: EvaluatedAward,
  styleKey: CertStyleKey,
): Promise<{ buffer: string; filename: string }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('callsign')
    .eq('id', user.id)
    .single()

  const callsign = profile?.callsign ?? 'UNKNOWN'
  const earnedDate = new Date()

  const element = React.createElement(CertDocument, {
    award,
    callsign,
    earnedDate,
    userId: user.id,
    styleKey,
  })

  // Cast needed because @react-pdf/renderer has strict internal types
  const buffer = await renderToBuffer(element as any)

  const filename = `OOTA_${award.award.slug}_${callsign}_${styleKey}.pdf`

  return {
    buffer: Buffer.from(buffer).toString('base64'),
    filename,
  }
}
