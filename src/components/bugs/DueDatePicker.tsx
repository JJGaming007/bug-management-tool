'use client'
import { FC } from 'react'

interface Props {
  value: string
  onChange: (v: string) => void
}

export const DueDatePicker: FC<Props> = ({ value, onChange }) => (
  <div>
    <label className="block mb-1 text-[var(--text)]">Due Date</label>
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="
        w-full px-3 py-2 mb-4
        bg-[var(--bg)] border border-[var(--border)]
        text-[var(--text)] rounded-lg
        focus:outline-none focus:ring focus:ring-[var(--accent-hover)]
      "
    />
  </div>
)
