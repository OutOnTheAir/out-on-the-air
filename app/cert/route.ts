// app/api/cert/route.ts
// API route for PDF certificate generation

import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { supabase } from '@/lib/supabase'
import CertDocument from '@/lib/cert/CertDocument'
import { type CertStyleKey } from '@/lib/cert/certStyles'
import React from 'react'

export async function POST(req: NextRequest) {
  try {
    const { award, styleKey } = await req.json()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

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
      styleKey: styleKey as CertStyleKey,
    })

    const buffer = await renderToBuffer(element as any)
    const filename = `OOTA_${award.award.slug}_${callsign}_${styleKey}.pdf`

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err: any) {
    console.error('Cert generation error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
