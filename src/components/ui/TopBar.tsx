'use client'

import { FC } from 'react'
import { useTheme } from '@/lib/context/ThemeContext'
import {
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline'

export const TopBar: FC = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="flex items-center justify-between bg-[var(--card)] border-b border-[var(--border)] px-4 py-2">
      <div className="flex items-center space-x-4">
        <span className="text-xl font-bold">Project:</span>
        <span className="font-medium">BugTracker</span>
      </div>

      <div className="flex-1 mx-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-5 w-5 text-[var(--subtext)] -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search issues, projects, users..."
            className="w-full pl-10 pr-4 py-1 rounded bg-[var(--bg)] border border-[var(--border)] focus:outline-none focus:ring focus:ring-[var(--accent-hover)]"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? (
            <MoonIcon className="h-6 w-6 text-[var(--text)]" />
          ) : (
            <SunIcon className="h-6 w-6 text-[var(--text)]" />
          )}
        </button>
        <BellIcon className="h-6 w-6 text-[var(--text)] cursor-pointer" />
        <UserCircleIcon className="h-8 w-8 text-[var(--text)] cursor-pointer" />
      </div>
    </header>
  )
}
