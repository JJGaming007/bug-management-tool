// src/components/ui/Sidebar.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname() ?? '/'
  const items = [
    { label: 'Dashboard', href: '/'},
    { label: 'Bugs', href: '/bugs' },
    { label: 'Board', href: '/board' },
    { label: 'Backlog', href: '/backlog' },
    { label: 'Sprints', href: '/sprints' },
    { label: 'Account', href: '/account' },
  ]

  return (
    <div>
      <div className="brand">
        <div className="dot" aria-hidden />
        <div className="text" style={{ fontWeight:700, fontSize: 18 }}>BugTracker</div>
      </div>

      <nav aria-label="Main Navigation">
        {items.map(i => {
          const active = pathname === i.href || pathname?.startsWith(i.href + '/')
          return (
            <Link key={i.href} href={i.href} className={`nav-item ${active ? 'active' : ''}`}>
              <span style={{ width: 26, textAlign: 'center', opacity: 0.9 }}>{i.label[0]}</span>
              <span>{i.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="tip" aria-hidden>
        <strong style={{ display: 'block', marginBottom: 8 }}>Tip</strong>
        Use search on the Bugs page to jump fast.
      </div>
    </div>
  )
}
