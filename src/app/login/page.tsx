'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Image from 'next/image'
import Link from 'next/link'

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
    <>
      <nav className="w-full border-b-1 text-white px-6 py-3 flex justify-center">
        <Link href="https://instantofferfurniture.com/" target="_blank">
          <Image
            src="/images/iof-logo-text.svg"
            width={150}
            height={0}
            alt="Instant Offer Furniture"
          />
        </Link>
      </nav>
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-8">
        <Card className="w-full max-w-md p-6 space-y-4">
          <CardHeader className="mb-0">
            <CardTitle>Login or Sign Up</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                autoComplete="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button
                variant="default"
                type="submit"
                className="w-full"
              >
                Send Login Link
              </Button>
            </form>
            {message && (
              <p className="mt-4 text-sm text-muted-foreground">{message}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}