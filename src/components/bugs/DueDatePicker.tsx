'use client'
import { FC } from 'react'

interface DueDatePickerProps {
  value?: string
  onChange: (date: string) => void
}

export const DueDatePicker: FC<DueDatePickerProps> = ({ value, onChange }) => (
  <div className="mb-2">
    <label className="block mb-1 font-medium">Due Date</label>
    <input
      type="date"
      value={value?.slice(0, 10) || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border rounded-lg"
    />
  </div>
)
