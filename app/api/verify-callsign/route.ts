import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const callsign = req.nextUrl.searchParams.get('callsign')

  if (!callsign) {
    return NextResponse.json({ error: 'Callsign required' }, { status: 400 })
  }

  try {
    const fccRes = await fetch(
      `https://data.fcc.gov/api/license.view/easSearch/license?callsign=${callsign}&format=json`,
      { cache: 'no-store' }
    )
    const fccData = await fccRes.json()

    // Return the raw response so we can see what the FCC actually sends back
    return NextResponse.json({ debug: true, raw: fccData })

  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'FCC lookup failed' }, { status: 500 })
  }
}
