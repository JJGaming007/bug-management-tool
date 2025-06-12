// src/components/ui/TopBar.tsx
'use client'
import { FC, useState } from 'react'

export const TopBar: FC = () => {
  const [q, setQ] = useState('')
  return (
    <header className="flex items-center justify-between bg-[var(--card)] border-b border-[var(--border)] px-6 py-3">
      {/* Project selector */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-lg">Project:</span>
        <button className="flex items-center gap-1 font-medium hover:text-[var(--accent)]">
          BugTracker <span className="text-sm">▼</span>
        </button>
      </div>

      {/* Global search */}
      <div className="flex items-center flex-1 px-4">
        <div className="relative w-full">
          <span
            className="absolute left-3 top-1/2 text-[var(--subtext)]"
            style={{ transform: 'translateY(-50%)' }}
          >
            🔍
          </span>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search issues, projects, users…"
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-[var(--bg)] focus:border-[var(--accent)]"
          />
        </div>
      </div>

      {/* Notifications & Profile */}
      <div className="flex items-center gap-4 text-[var(--subtext)]">
        <span className="cursor-pointer hover:text-[var(--accent-hover)]">🔔</span>
        <span className="cursor-pointer hover:text-[var(--accent-hover)]">👤</span>
      </div>
    </header>
  )
}
