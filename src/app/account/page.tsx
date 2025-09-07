'use client'

import React, { useState } from 'react'

export default function AccountPage() {
  const [password, setPassword] = useState('')

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) return alert('Password must be at least 6 characters')
    console.log('Update password to', password)
    setPassword('')
  }

  return (
    <div className="content">
      <h1>Account Settings</h1>
      <div className="card">
        <form onSubmit={handleUpdate} className="col" style={{ gap: 16 }}>
          <label className="col">
            <span>Email</span>
            <input type="email" value="jibin.jose@supergaming.com" readOnly />
          </label>
          <label className="col">
            <span>New Password</span>
            <input
              type="password"
              placeholder="••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </label>
          <div className="row" style={{ gap: 12 }}>
            <button type="submit" className="btn primary">Update Password</button>
            <button type="button" className="btn">Sign Out</button>
          </div>
        </form>
      </div>
    </div>
  )
}
