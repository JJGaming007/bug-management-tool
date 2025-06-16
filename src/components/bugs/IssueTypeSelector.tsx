// src/components/bugs/IssueTypeSelector.tsx
'use client'

import { FC } from 'react'

const ISSUE_TYPES = ['Bug', 'Task', 'Story'] as const
export type IssueType = typeof ISSUE_TYPES[number]

interface Props {
  value: IssueType
  onChange: (v: IssueType) => void
}

export const IssueTypeSelector: FC<Props> = ({ value, onChange }) => (
  <div>
    <label className="block mb-1">Issue Type</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as IssueType)}
      className="w-full px-3 py-2 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring focus:ring-[var(--accent-hover)]"
    >
      {ISSUE_TYPES.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  </div>
)
