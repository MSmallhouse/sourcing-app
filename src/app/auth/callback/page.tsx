'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    async function checkProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login')
        return
      }

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', session.user.id)
        .single()
      
      // Redirect to complete-profile if missing profile info
      if (!profile?.first_name || !profile?.last_name) {
        router.replace('/complete-profile')
      } else {
        router.replace('/faqs')
      }
    }

    checkProfile()
  }, [router])

  return <p className="p-6">Finishing sign-in…</p>
}