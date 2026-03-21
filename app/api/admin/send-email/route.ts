import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const { subject, body } = await req.json()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profiles } = await supabase
    .from('profiles')
    .select('email')
    .eq('is_active', true)

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ error: 'No users found' }, { status: 400 })
  }

  const emails = profiles.map(p => p.email).filter(Boolean)

  await resend.emails.send({
    from: 'OOTA <noreply@outontheair.com>',
    to: emails,
    subject,
    text: body,
  })

  return NextResponse.json({ ok: true })
}
