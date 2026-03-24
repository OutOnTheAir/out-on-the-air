import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)

    if (session?.user) {
      const uid = session.user.id
      const cs  = session.user.user_metadata?.callsign ?? ''

      await supabase.from('profiles').upsert({
        id:           uid,
        callsign:     cs,
        display_name: cs,
        is_active:    true,
        created_at:   new Date().toISOString(),
      }, { onConflict: 'id' })

      await supabase.from('users').upsert({
        id:           uid,
        callsign:     cs,
        display_name: cs,
        is_active:    true,
        created_at:   new Date().toISOString(),
      }, { onConflict: 'id' })
    }
  }

  return NextResponse.redirect(new URL('/spots', request.url))
}
