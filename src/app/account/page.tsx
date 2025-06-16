'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

export default function AccountPage() {
  const { user, signOut } = useAuth()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) return toast.error('Enter a new password')
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) toast.error(error.message)
    else {
      toast.success('Password updated')
      setPassword('')
    }
  }

  return (
    <div className="p-4 space-y-6">
      <Breadcrumbs />
      <h1 className="text-2xl font-semibold text-[var(--text)]">Account Settings</h1>

      <form onSubmit={handleUpdate} className="max-w-md space-y-4">
        {/* Email (read-only) */}
        <div>
          <label className="block mb-1 text-[var(--text)]">Email</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)]"
          />
        </div>

        {/* Change password */}
        <div>
          <label className="block mb-1 text-[var(--text)]">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-[var(--accent)] text-black rounded-lg hover:bg-[var(--accent-hover)]"
        >
          {loading ? 'Updating…' : 'Update Password'}
        </button>
      </form>

      <hr className="border-[var(--border)]" />

      <button
        onClick={() => signOut()}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Sign Out
      </button>
    </div>
  )
}
