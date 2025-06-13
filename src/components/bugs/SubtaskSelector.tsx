'use client'
import { FC } from 'react'
import type { Pick as DBPick } from '@/types'

interface Props {
  value: number | null
  bugs: { id: number; title: string }[]
  onChange: (v: number | null) => void
}

export const SubtaskSelector: FC<Props> = ({ value, bugs, onChange }) => (
  <div>
    <label className="block mb-1 text-[var(--text)]">Parent Issue</label>
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value ? +e.target.value : null)}
      className="
        w-full px-3 py-2 mb-4
        bg-[var(--bg)] border border-[var(--border)]
        text-[var(--text)] rounded-lg
        focus:outline-none focus:ring focus:ring-[var(--accent-hover)]
      "
    >
      <option value="">None</option>
      {bugs.map((b) => (
        <option key={b.id} value={b.id}>
          {b.title}
        </option>
      ))}
    </select>
  </div>
)
