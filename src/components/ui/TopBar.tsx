// src/components/ui/TopBar.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'

export default function TopBar() {
  let auth = null
  try {
    auth = useAuth()
  } catch (e) {
    // If no auth provider, fallback gracefully
    auth = { user: { email: 'guest@example.com' }, logout: () => {} }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#071014', borderRadius: 8 }}>
        <span style={{ fontWeight: 700 }}>BT</span>
      </div>

      <div className="search" role="search">
        <input type="search" placeholder="Search bugs, epics, comments..." aria-label="Search" />
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
        <button className="btn" aria-label="Notifications" title="Notifications">🔔</button>
        <div className="user-pill">
          <span style={{ fontSize: 13 }}>{auth?.user?.email ?? 'not-signed'}</span>
          <Link href="/api/logout"><button className="btn" style={{ marginLeft: 8, fontWeight:600 }}>Sign out</button></Link>
        </div>
      </div>
    </div>
  )
}
