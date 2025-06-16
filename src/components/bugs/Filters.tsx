'use client'

import { FC, useEffect } from 'react'

interface FiltersProps {
  filters: { status: { open: boolean; in_progress: boolean; closed: boolean } }
  onChange: (f: FiltersProps['filters']) => void
  className?: string
}

export const Filters: FC<FiltersProps> = ({ filters, onChange, className = '' }) => {
  // Keyboard shortcuts: O = open, I = in_progress, C = closed
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return

      let changed = false
      const s = { ...filters.status }

      switch (e.key.toLowerCase()) {
        case 'o':
          s.open = !s.open
          changed = true
          break
        case 'i':
          s.in_progress = !s.in_progress
          changed = true
          break
        case 'c':
          s.closed = !s.closed
          changed = true
          break
      }
      if (changed) onChange({ status: s })
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [filters, onChange])

  return (
    <div
      className={`flex flex-col p-4 bg-[var(--card)] border border-[var(--border)] rounded ${className}`}
    >
      <h3 className="mb-2 font-semibold text-[var(--text)]">Filters</h3>
      <div className="space-y-2">
        <label className="flex items-center text-[var(--text)]">
          <input
            type="checkbox"
            checked={filters.status.open}
            onChange={() =>
              onChange({ status: { ...filters.status, open: !filters.status.open } })
            }
            className="mr-2"
          />
          Open
        </label>
        <label className="flex items-center text-[var(--text)]">
          <input
            type="checkbox"
            checked={filters.status.in_progress}
            onChange={() =>
              onChange({
                status: { ...filters.status, in_progress: !filters.status.in_progress },
              })
            }
            className="mr-2"
          />
          In Progress
        </label>
        <label className="flex items-center text-[var(--text)]">
          <input
            type="checkbox"
            checked={filters.status.closed}
            onChange={() =>
              onChange({ status: { ...filters.status, closed: !filters.status.closed } })
            }
            className="mr-2"
          />
          Closed
        </label>
      </div>
      <p className="mt-4 text-xs text-[var(--subtext)]">
        Shortcuts: <kbd>O</kbd>, <kbd>I</kbd>, <kbd>C</kbd>
      </p>
    </div>
  )
}
