// src/app/login/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/context/AuthContext'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { signIn } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn(email, password)
      toast.success('Logged in!')
      router.push('/') // or router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--bg)]">
      <form
        onSubmit={handleSubmit}
        className="bg-[var(--card)] p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold mb-6 text-[var(--text)]">
          Log In
        </h2>

        {/* Email */}
        <label className="block mb-2 text-[var(--text)]">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 mb-4 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring focus:ring-[var(--accent-hover)]"
        />

        {/* Password */}
        <label className="block mb-2 text-[var(--text)]">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 mb-6 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring focus:ring-[var(--accent-hover)]"
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-[var(--accent)] text-black rounded hover:bg-[var(--accent-hover)] transition"
        >
          {loading ? 'Logging in…' : 'Log In'}
        </button>

        {/* Signup Link */}
        <p className="mt-4 text-sm text-[var(--subtext)]">
          Don’t have an account?{' '}
          <Link
            href="/signup"
            className="text-[var(--accent)] underline hover:text-[var(--accent-hover)]"
          >
            Sign up
          </Link>
        </p>
      </form>
    </div>
  )
}
