'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/context/AuthContext'
import toast from 'react-hot-toast'

const KeyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
)

const LogOutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
)

export default function AccountPage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  let auth: { user?: { email?: string } | null } | null = null
  try {
    auth = useAuth()
  } catch {
    auth = { user: null }
  }

  const userEmail = auth?.user?.email ?? 'Not signed in'
  const userInitial = userEmail[0]?.toUpperCase() ?? '?'

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) throw updateError

      toast.success('Password updated successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update password'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Account Settings</h1>
        <p className="page-subtitle">Manage your account preferences and security</p>
      </div>

      <div style={{ display: 'grid', gap: '20px', maxWidth: '640px' }}>
        {/* Profile Card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Profile</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: 'white',
                }}
              >
                {userInitial}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>
                  {userEmail.split('@')[0]}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  {userEmail}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <KeyIcon />
              <span className="card-title">Change Password</span>
            </div>
          </div>
          <div className="card-body">
            {error && (
              <div className="alert alert-error" style={{ marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleUpdatePassword}>
              <div className="input-group">
                <label className="input-label">Current Password</label>
                <input
                  type="password"
                  className="input"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">New Password</label>
                <input
                  type="password"
                  className="input"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Confirm New Password</label>
                <input
                  type="password"
                  className="input"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ marginTop: '8px' }}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>

        {/* Sign Out Card */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LogOutIcon />
              <span className="card-title">Sign Out</span>
            </div>
          </div>
          <div className="card-body">
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>
              Sign out of your account on this device.
            </p>
            <button className="btn btn-danger" onClick={handleSignOut}>
              <LogOutIcon />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
