'use client'
import { FC } from 'react'

interface FiltersProps {
  statusOptions: string[]
  priorityOptions: string[]
  selectedStatus: string[]
  selectedPriority: string[]
  searchQuery: string
  onStatusChange: (s: string[]) => void
  onPriorityChange: (p: string[]) => void
  onSearchChange: (q: string) => void
}

export const Filters: FC<FiltersProps> = ({
  statusOptions,
  priorityOptions,
  selectedStatus,
  selectedPriority,
  searchQuery,
  onStatusChange,
  onPriorityChange,
  onSearchChange,
}) => (
  <div className="flex flex-wrap gap-4 mb-4">
    <input
      type="text"
      placeholder="Search bugs..."
      value={searchQuery}
      onChange={(e) => onSearchChange(e.target.value)}
      className="px-3 py-1 border rounded-lg flex-1"
    />
    <select
      multiple
      value={selectedStatus}
      onChange={(e) => onStatusChange(Array.from(e.target.selectedOptions, (o) => o.value))}
      className="px-3 py-1 border rounded-lg"
    >
      {statusOptions.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
    <select
      multiple
      value={selectedPriority}
      onChange={(e) => onPriorityChange(Array.from(e.target.selectedOptions, (o) => o.value))}
      className="px-3 py-1 border rounded-lg"
    >
      {priorityOptions.map((p) => (
        <option key={p} value={p}>
          {p}
        </option>
      ))}
    </select>
  </div>
)
