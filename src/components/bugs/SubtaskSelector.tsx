// src/components/bugs/SubtaskSelector.tsx
'use client'

import { FC } from 'react'

interface BugOption {
  id: number
  title: string
}

interface Props {
  value: number | null
  bugs: BugOption[]
  onChange: (id: number | null) => void
}

export const SubtaskSelector: FC<Props> = ({
  value,
  bugs,
  onChange,
}) => (
  <div>
    <label className="block mb-1">Parent Issue</label>
    <select
      value={value ?? ''}
      onChange={(e) =>
        onChange(e.target.value ? Number(e.target.value) : null)
      }
      className="w-full px-3 py-2 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring focus:ring-[var(--accent-hover)]"
    >
      <option value="">None</option>
      {bugs.map((b) => (
        <option key={b.id} value={b.id}>
          {b.title} (#{b.id})
        </option>
      ))}
    </select>
  </div>
)
