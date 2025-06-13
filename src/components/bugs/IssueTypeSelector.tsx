'use client'
import { FC } from 'react'

interface IssueTypeSelectorProps {
  value: 'Bug' | 'Task' | 'Story' | 'Sub-task'
  onChange: (v: 'Bug' | 'Task' | 'Story' | 'Sub-task') => void
}

export const IssueTypeSelector: FC<IssueTypeSelectorProps> = ({ value, onChange }) => (
  <div className="mb-2">
    <label className="block mb-1 font-medium">Issue Type</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as any)}
      className="w-full px-3 py-2 border rounded-lg"
    >
      <option value="Bug">Bug</option>
      <option value="Task">Task</option>
      <option value="Story">Story</option>
      <option value="Sub-task">Sub-task</option>
    </select>
  </div>
)
