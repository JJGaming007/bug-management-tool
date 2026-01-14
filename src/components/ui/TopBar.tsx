'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import { useSidebar } from '@/lib/context/SidebarContext'
import { supabase } from '@/lib/supabase/client'

// Icons
const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
)

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
)

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
)

const LogOutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
)

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

export default function TopBar() {
  const router = useRouter()
  const { toggle } = useSidebar()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notificationCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  let auth: { user?: { email?: string } | null; logout?: () => void } | null = null
  try {
    auth = useAuth()
  } catch {
    auth = { user: null, logout: () => {} }
  }

  const userEmail = auth?.user?.email ?? 'Guest'
  const userInitial = userEmail[0]?.toUpperCase() ?? 'G'

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/bugs?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <div className="topbar">
      <div className="topbar-left">
        <button
          className="topbar-btn menu-btn"
          onClick={toggle}
          aria-label="Toggle sidebar"
        >
          <MenuIcon />
        </button>
        <form onSubmit={handleSearch} className="topbar-search">
          <span className="topbar-search-icon">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search bugs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="topbar-right">
        <button
          className="topbar-btn"
          aria-label="Notifications"
          style={{ position: 'relative' }}
        >
          <BellIcon />
          {notificationCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              background: '#ef4444',
              borderRadius: '50%',
            }} />
          )}
        </button>

        <div className="dropdown" ref={dropdownRef}>
          <button
            className="topbar-user-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              background: 'var(--surface-2)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              color: 'var(--text-primary)',
            }}
          >
            <div className="topbar-avatar">{userInitial}</div>
            <span style={{ fontSize: '13px', fontWeight: 500, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userEmail.split('@')[0]}
            </span>
            <ChevronDownIcon />
          </button>

          {dropdownOpen && (
            <div className="dropdown-menu">
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {userEmail.split('@')[0]}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {userEmail}
                </div>
              </div>

              <div
                className="dropdown-item"
                onClick={() => {
                  setDropdownOpen(false)
                  router.push('/account')
                }}
              >
                <UserIcon />
                <span>Account Settings</span>
              </div>

              <div className="dropdown-divider" />

              <div
                className="dropdown-item"
                onClick={handleSignOut}
                style={{ color: '#ef4444' }}
              >
                <LogOutIcon />
                <span>Sign Out</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
