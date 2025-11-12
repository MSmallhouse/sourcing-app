'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if a session already exists
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Already logged in → redirect
        router.replace('/dashboard')
      }
    })
  }, [router])

  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`, // redirect after clicking email link
      },
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Check your email for the login link!')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white text-gray-900 rounded-2xl shadow">
        <h1 className="text-2xl font-semibold mb-4">Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg p-2"
            required
          />
          <Button
            variant="outline"
            type="submit"
          >
            Send Magic Link
          </Button>
        </form>
        {message && (
          <p className="mt-4 text-sm text-gray-600">{message}</p>
        )}
      </div>
    </div>
  )
}