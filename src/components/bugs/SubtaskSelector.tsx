'use client'

import { FC } from 'react'

interface BugOption { id: number | string; title: string }
interface Props {
  value: number | string | null
  onChange: (id: number | string | null) => void
  /** Accept both names to avoid breaking old callers */
  options?: BugOption[]
  bugs?: BugOption[]
}

export const SubtaskSelector: FC<Props> = ({ value, onChange, options, bugs }) => {
  const items: BugOption[] = Array.isArray(options) ? options : (Array.isArray(bugs) ? bugs : [])

  return (
    <div>
      <label className="block mb-1" style={{ color: 'var(--subtext)' }}>Parent Task</label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className="select"
      >
        <option value="">None</option>
        {items.map((b) => (
          <option key={String(b.id)} value={String(b.id)}>
            {b.title} (#{b.id})
          </option>
        ))}
      </select>
    </div>
  )
}
