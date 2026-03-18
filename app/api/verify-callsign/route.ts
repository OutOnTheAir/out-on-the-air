import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const callsign = req.nextUrl.searchParams.get('callsign')?.toUpperCase().trim()

  if (!callsign) {
    return NextResponse.json({ valid: false, reason: 'No callsign provided' })
  }

  try {
    const res = await fetch(`https://callook.info/${callsign}/json`, {
      cache: 'no-store',
      headers: { 'User-Agent': 'OOTA-App/1.0 (outontheair.com)' }
    })

    const data = await res.json()

    // callook returns { status: 'VALID', ... } or { status: 'INVALID' }
    if (data.status === 'VALID') {
      return NextResponse.json({ valid: true, name: data.name, type: data.type })
    } else {
      return NextResponse.json({ valid: false, reason: 'Callsign not found in FCC database' })
    }

  } catch (err: any) {
    console.error('Callook error:', err)
    // Fallback: if the lookup service is down, fail open with a warning
    return NextResponse.json({ valid: false, reason: 'Verification service unavailable. Please try again.' })
  }
}
