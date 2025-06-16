// src/components/bugs/DueDatePicker.tsx
'use client'

import { FC } from 'react'

interface Props {
  value: string
  onChange: (date: string) => void
}

export const DueDatePicker: FC<Props> = ({ value, onChange }) => (
  <div>
    <label className="block mb-1">Due Date</label>
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring focus:ring-[var(--accent-hover)]"
    />
  </div>
)
