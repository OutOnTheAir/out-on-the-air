import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()

    // Auth client (anon key) — only for session exchange
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

      // Admin client (service role key) — bypasses RLS for reliable upserts
      const adminSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      await adminSupabase.from('profiles').upsert({
        id:           uid,
        callsign:     cs,
        display_name: cs,
        is_active:    true,
        created_at:   new Date().toISOString(),
      }, { onConflict: 'id' })

      await adminSupabase.from('users').upsert({
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
