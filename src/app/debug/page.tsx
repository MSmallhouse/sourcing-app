'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function DebugPage() {
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    // Get the current session on mount
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    // Listen for auth changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Not logged in</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <h1 className="text-2xl font-semibold">Debug – Current Session</h1>
      <pre className="bg-gray-100 text-gray-900 p-4 rounded-lg max-w-md overflow-auto text-sm">
        {JSON.stringify(session, null, 2)}
      </pre>
      <button
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
        onClick={async () => {
          await supabase.auth.signOut()
          window.location.href = '/login'
        }}
      >
        Log out
      </button>
    </div>
  )
}
