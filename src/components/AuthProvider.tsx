'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

const PUBLIC_ROUTES = ['/', '/login', '/auth/callback']

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        // If logged out AND not already on a public route → send to login
        if (!session && !PUBLIC_ROUTES.includes(pathname)) {
          window.location.href = '/login'
        }
        // If logged in, upsert the user's email into profiles
        if (session?.user) {
          await supabase.from('profiles').upsert({
            id: session.user.id,
            email: session.user.email,
          })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [pathname])

  return <>{children}</>
}