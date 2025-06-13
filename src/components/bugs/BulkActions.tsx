// src/components/bugs/BulkActions.tsx
'use client'

import { FC } from 'react'

interface BulkActionsProps {
  selectedCount: number
  onClear: () => void
  onChangeStatus: (status: 'Open' | 'In Progress' | 'Closed') => void
  onDelete: () => void
}

export const BulkActions: FC<BulkActionsProps> = ({
  selectedCount,
  onClear,
  onChangeStatus,
  onDelete,
}) => {
  return (
    <div
      role="toolbar"
      aria-label="Bulk actions toolbar"
      className="flex items-center justify-between bg-[var(--card)] border-b border-[var(--border)] p-4 mb-4 rounded-t"
    >
      <span className="text-[var(--text)]">
        {selectedCount} selected
      </span>
      <div className="space-x-2">
        <button
          onClick={() => onChangeStatus('Open')}
          className="px-3 py-1 rounded bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)] transition"
        >
          Mark Open
        </button>
        <button
          onClick={() => onChangeStatus('In Progress')}
          className="px-3 py-1 rounded bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)] transition"
        >
          Mark In Progress
        </button>
        <button
          onClick={() => onChangeStatus('Closed')}
          className="px-3 py-1 rounded bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)] transition"
        >
          Mark Closed
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition"
        >
          Delete
        </button>
        <button
          onClick={onClear}
          className="px-3 py-1 text-[var(--subtext)] hover:underline"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
