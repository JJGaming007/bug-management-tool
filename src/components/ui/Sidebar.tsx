'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'  // updated
// No default import—named exports only

export function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger button */}
      <div className="md:hidden p-4">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="focus:outline-none"
        >
          <Bars3Icon className="h-6 w-6 text-[var(--text)]" /> {/* updated */}
        </button>
      </div>

      {/* Sidebar drawer */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64
          transform bg-[var(--card)] border-r border-[var(--border)]
          transition-transform duration-200 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 md:shadow-none
        `}
      >
        {/* Close button on mobile */}
        <div className="flex items-center justify-between md:hidden p-4">
          <span className="text-xl font-bold text-[var(--text)]">BugTracker</span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="focus:outline-none"
          >
            <XMarkIcon className="h-6 w-6 text-[var(--text)]" /> {/* updated */}
          </button>
        </div>

        {/* Nav links */}
        <nav className="p-4 space-y-4 text-lg">
          <Link href="/dashboard" className="block hover:text-[var(--accent)]">
            Dashboard
          </Link>
          <Link href="/bugs" className="block hover:text-[var(--accent)]">
            Bugs
          </Link>
          <Link href="/sprints" className="block hover:text-[var(--accent)]">
            Sprints
          </Link>
          <Link href="/backlog" className="block hover:text-[var(--accent)]">
            Backlog
          </Link>
        </nav>
      </aside>

      {/* Backdrop when open on mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}
