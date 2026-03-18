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

    const licenses = fccData?.Licenses?.License ?? []

    // Accept any active license — amateur service codes are HA (Technician/General/Extra)
    // and HV (Novice). We check statusDesc = 'Active' and that a license exists at all.
    const activeLicense = licenses.find((lic: any) =>
      lic.statusDesc?.toLowerCase() === 'active'
    )

    return NextResponse.json({ valid: !!activeLicense, count: licenses.length })
  } catch (err) {
    console.error('FCC lookup error:', err)
    return NextResponse.json({ error: 'FCC lookup failed' }, { status: 500 })
  }
}
