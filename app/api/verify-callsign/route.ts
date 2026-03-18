import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const callsign = req.nextUrl.searchParams.get('callsign')

  if (!callsign) {
    return NextResponse.json({ error: 'Callsign required' }, { status: 400 })
  }

  try {
    const fccRes = await fetch(
      `https://data.fcc.gov/api/license.view/easSearch/license?callsign=${callsign}&format=json`,
      { next: { revalidate: 0 } }
    )
    const fccData = await fccRes.json()

    const licenses = fccData?.Licenses?.License ?? []
    const amateurLicense = licenses.find((lic: any) =>
      lic.categoryDesc?.toLowerCase().includes('amateur') &&
      lic.statusDesc?.toLowerCase() === 'active'
    )

    return NextResponse.json({ valid: !!amateurLicense })
  } catch (err) {
    return NextResponse.json({ error: 'FCC lookup failed' }, { status: 500 })
  }
}
