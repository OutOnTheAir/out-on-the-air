import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const { subject, body, userId } = await req.json()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let emails: string[] = []

  if (userId) {
    // Single user email
    const { data: { user } } = await supabase.auth.admin.getUserById(userId)
    if (!user?.email) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    emails = [user.email]
  } else {
    // All members
    const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    emails = users.map(u => u.email).filter(Boolean) as string[]
  }

  if (emails.length === 0) {
    return NextResponse.json({ error: 'No emails found' }, { status: 400 })
  }

  await resend.emails.send({
    from: 'OOTA <noreply@outontheair.com>',
    to: emails,
    subject,
    text: body,
  })

  return NextResponse.json({ ok: true })
}
