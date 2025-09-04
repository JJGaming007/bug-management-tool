'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import { BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export function TopBar() {
  const { user, signOut } = useAuth()
  const [q, setQ] = useState('')

  return (
    <header className="sticky top-0 z-40">
      <div className="container" style={{ padding: 16 }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
            <MagnifyingGlassIcon width={18} height={18} style={{ opacity: .7 }} />
            <input
              className="input"
              placeholder="Search bugs, epics, comments…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <button className="btn secondary" title="Notifications">
            <BellIcon width={18} height={18} />
          </button>

          <div style={{ width: 1, height: 28, background: 'var(--border)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 12, opacity: .8 }}>{user?.email}</div>
            <button className="btn secondary" onClick={signOut}>Sign out</button>
          </div>
        </div>
      </div>
    </header>
  )
}
