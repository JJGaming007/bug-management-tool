'use client'
import { FC } from 'react'

interface SubtaskSelectorProps {
  value?: number | null
  bugs: { id: number; title: string }[]
  onChange: (id: number | null) => void
}

export const SubtaskSelector: FC<SubtaskSelectorProps> = ({ value, bugs, onChange }) => (
  <div className="mb-2">
    <label className="block mb-1 font-medium">Parent Issue</label>
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value ? +e.target.value : null)}
      className="w-full px-3 py-2 border rounded-lg"
    >
      <option value="">None</option>
      {bugs.map((b) => (
        <option key={b.id} value={b.id}>
          #{b.id} – {b.title}
        </option>
      ))}
    </select>
  </div>
)
