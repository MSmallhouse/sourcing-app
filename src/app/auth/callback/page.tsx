'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    // This will complete the login and persist the session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/debug') // or dashboard later
      } else {
        router.replace('/login')
      }
    })
  }, [router])

  return <p className="p-6">Finishing sign-in…</p>
}