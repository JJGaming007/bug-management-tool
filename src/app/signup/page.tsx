'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [show, setShow] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true); setError(null)
    try {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      // If email confirmation is enabled, you might redirect to a "check your email" page
      router.replace('/dashboard')
    } catch (e: any) {
      setError(e?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center">
      <div className="card" style={{ width: 420, maxWidth: '90%', padding: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Create account</h1>
        <p style={{ marginTop: 6, color: 'var(--subtext)' }}>Start tracking bugs in minutes</p>

        {error && (
          <div
            style={{
              marginTop: 12,
              color: '#fecaca',
              background: 'rgba(239,68,68,.1)',
              border: '1px solid rgba(239,68,68,.4)',
              padding: 10,
              borderRadius: 12,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <div>
            <label className="block mb-1" style={{ color: 'var(--subtext)' }}>Email</label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1" style={{ color: 'var(--subtext)' }}>Password</label>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                type={show ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button type="button" className="btn secondary" onClick={() => setShow((s) => !s)}>
                {show ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div>
            <label className="block mb-1" style={{ color: 'var(--subtext)' }}>Confirm password</label>
            <input
              className="input"
              type={show ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <div style={{ marginTop: 14, fontSize: 14, color: 'var(--subtext)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ textDecoration: 'underline', color: 'var(--text)' }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
