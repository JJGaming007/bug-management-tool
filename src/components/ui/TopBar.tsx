'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { BellIcon, Cog6ToothIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useTheme } from '@/lib/context/ThemeContext'
import { useAuth } from '@/lib/context/AuthContext'

// click‐outside helper
function useOutsideClick(ref: React.RefObject<HTMLElement>, handler: () => void) {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return
      handler()
    }
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [ref, handler])
}

export function TopBar() {
  const { theme, toggle } = useTheme()
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  useOutsideClick(menuRef, () => setMenuOpen(false))

  return (
    <header className="flex items-center justify-between bg-[var(--card)] border-b border-[var(--border)] px-4 py-2">
      {/* global search */}
      <div className="flex-1 max-w-md">
        <div className="relative text-gray-500">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4 ml-4">
        {/* notifications */}
        <button aria-label="Notifications">
          <BellIcon className="h-6 w-6 text-[var(--subtext)] hover:text-[var(--text)]" />
        </button>

        {/* theme toggle */}
        <button onClick={toggle} aria-label="Toggle theme">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {/* user menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center space-x-2"
            aria-label="User menu"
          >
            <div className="h-8 w-8 rounded-full bg-[var(--border)] flex items-center justify-center">
              {user?.email?.[0].toUpperCase()}
            </div>
            <Cog6ToothIcon className="h-5 w-5 text-[var(--subtext)] hover:text-[var(--text)]" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg">
              <Link href="/account" className="block px-4 py-2 hover:bg-[var(--border)]">
                Account Settings
              </Link>
              <button
                onClick={() => signOut()}
                className="w-full text-left px-4 py-2 hover:bg-[var(--border)]"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
