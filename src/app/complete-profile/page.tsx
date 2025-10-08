'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function CompleteProfile() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
        .select('first_name, last_name')
        .eq('id', session.user.id)
        .single()
      if (profile) {
        setFirstName(profile.first_name || '')
        setLastName(profile.last_name || '')
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
        <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow space-y-4 text-center">
          <h1 className="text-2xl font-semibold mb-4">Profile Updated!</h1>
          <p>Your information was successfully updated.</p>
          <Link
            href="/dashboard"
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-6 bg-white rounded-2xl shadow space-y-4"
      >
        <h1 className="text-2xl font-semibold mb-4">Complete Your Profile</h1>
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          className="w-full border rounded-lg p-2"
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={e => setLastName(e.target.value)}
          className="w-full border rounded-lg p-2"
          required
        />
        {error && <p className="text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  )
}