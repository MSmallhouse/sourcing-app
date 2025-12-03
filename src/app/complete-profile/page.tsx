'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function CompleteProfile() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [sourcerPhone, setSourcerPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, sourcer_phone')
        .eq('id', session.user.id)
        .single()
      if (profile) {
        setFirstName(profile.first_name || '')
        setLastName(profile.last_name || '')
        setSourcerPhone(profile.sourcer_phone || '')
      }
      setLoading(false)
    }
    fetchProfile()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setError('Session expired. Please log in again.')
      setSaving(false)
      router.replace('/login')
      return
    }
    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      first_name: firstName,
      last_name: lastName,
      sourcer_phone: sourcerPhone,
    })
    if (error) {
      setError(error.message)
      setSaving(false)
    } else {
      setSuccess(true)
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <Card className="w-full max-w-md p-6 space-y-4 text-center">
          <CardHeader>
            <CardTitle>Profile Updated!</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Your information was successfully updated.</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <Card className="w-full max-w-md p-6 space-y-4">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              required
            />
            <Input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              required
            />
            <Input
              type="tel"
              placeholder="Phone Number"
              pattern="[\d\s\-\+\(\)]*"
              value={sourcerPhone}
              onChange={e => setSourcerPhone(e.target.value)}
              required
            />
            {error && <p className="text-red-600">{error}</p>}
            <Button
              variant="default"
              type="submit"
              disabled={saving}
              className="w-full"
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}