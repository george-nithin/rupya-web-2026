import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    console.log('Auth Callback initiated', { code: code ? 'PRESENT' : 'MISSING', next, origin });

    if (code) {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        console.log('Setting cookie:', name);
                        try {
                            cookieStore.set({ name, value, ...options })
                        } catch (error) {
                            console.error('Error setting cookie', name, error)
                        }
                    },
                    remove(name: string, options: CookieOptions) {
                        console.log('Removing cookie:', name);
                        try {
                            cookieStore.delete({ name, ...options })
                        } catch (error) {
                            console.error('Error removing cookie', name, error)
                        }
                    },
                },
            }
        )

        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            console.log('Session exchange successful', { user: data.user?.id });
            return NextResponse.redirect(`${origin}${next}`)
        } else {
            console.error('Session exchange error:', error);
        }
    } else {
        console.warn('No code provided in callback URL');
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
