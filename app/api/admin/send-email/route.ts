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
    const { data: { user } } = await supabase.auth.admin.getUserById(userId)
    if (!user?.email) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    emails = [user.email]
  } else {
    const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    emails = users.map(u => u.email).filter(Boolean) as string[]
  }

  if (emails.length === 0) {
    return NextResponse.json({ error: 'No emails found' }, { status: 400 })
  }

  if (emails.length === 1) {
    // Single send for solo emails
    await resend.emails.send({
      from: 'OOTA <noreply@outontheair.com>',
      to: emails[0],
      subject,
      text: body,
    })
  } else {
    // Batch send — one API call, individual emails, no one sees others' addresses
    const messages = emails.map(email => ({
      from: 'OOTA <noreply@outontheair.com>',
      to: email,
      subject,
      text: body,
    }))

    // Resend batch limit is 100 per call — chunk if needed
    const chunkSize = 100
    for (let i = 0; i < messages.length; i += chunkSize) {
      await resend.batch.send(messages.slice(i, i + chunkSize))
    }
  }

  return NextResponse.json({ ok: true })
}
