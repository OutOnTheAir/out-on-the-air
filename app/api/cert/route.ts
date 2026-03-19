// app/api/cert/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import CertDocument from '@/lib/cert/CertDocument'
import { type CertStyleKey } from '@/lib/cert/certStyles'
import React from 'react'

export async function POST(req: NextRequest) {
  try {
    const { award, styleKey, callsign } = await req.json()

    const element = React.createElement(CertDocument, {
      award,
      callsign: callsign ?? 'WW1ZRD',
      earnedDate: new Date(),
      userId: 'user',
      styleKey: styleKey as CertStyleKey,
    })

    const buffer = await renderToBuffer(element as any)

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="OOTA_${award.award.slug}_${styleKey}.pdf"`,
      },
    })
  } catch (err: any) {
    console.error('Cert generation error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
