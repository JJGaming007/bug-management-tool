// src/components/bugs/Filters.tsx
'use client'

import { FC, useState } from 'react'

type StatusKey = 'open' | 'in_progress' | 'closed'
interface Filters {
  status: Record<StatusKey, boolean>
}
interface FiltersProps {
  filters: Filters
  onChange: (f: Filters) => void
}

export const Filters: FC<FiltersProps> = ({ filters, onChange }) => {
  const [collapsed, setCollapsed] = useState(false)

  const toggle = (key: StatusKey) =>
    onChange({
      ...filters,
      status: { ...filters.status, [key]: !filters.status[key] },
    })

  return (
    <aside
      role="region"
      aria-labelledby="filters-heading"
      className={`
        flex-shrink-0 bg-[var(--card)] border-r border-[var(--border)] p-4 
        ${collapsed ? 'w-12' : 'w-56'} transition-width
      `}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? 'Expand filters' : 'Collapse filters'}
        aria-expanded={!collapsed}
        className="mb-4 text-sm focus:outline-none"
      >
        {collapsed ? '»' : '«'}
      </button>

      {!collapsed && (
        <div>
          <h2 id="filters-heading" className="font-semibold mb-2">
            Status
          </h2>
          {(['open', 'in_progress', 'closed'] as StatusKey[]).map((key) => (
            <label key={key} className="flex items-center mb-1" htmlFor={`filter-${key}`}>
              <input
                id={`filter-${key}`}
                type="checkbox"
                checked={filters.status[key]}
                onChange={() => toggle(key)}
                className="mr-2"
              />
              {key === 'in_progress'
                ? 'In Progress'
                : key.charAt(0).toUpperCase() + key.slice(1)}
            </label>
          ))}
        </div>
      )}
    </aside>
  )
}
