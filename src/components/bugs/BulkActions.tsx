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
    <div className="flex items-center justify-between p-4 bg-[var(--card)] border-b border-[var(--border)]">
      <span className="text-[var(--text)]">{selectedCount} selected</span>
      <div className="flex gap-2">
        <button
          onClick={() => onChangeStatus('Open')}
          className="px-3 py-1 bg-green-500 text-white rounded"
        >
          Mark Open
        </button>
        <button
          onClick={() => onChangeStatus('In Progress')}
          className="px-3 py-1 bg-yellow-500 text-white rounded"
        >
          Mark In Progress
        </button>
        <button
          onClick={() => onChangeStatus('Closed')}
          className="px-3 py-1 bg-gray-500 text-white rounded"
        >
          Mark Closed
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1 bg-red-600 text-white rounded"
        >
          Delete
        </button>
        <button onClick={onClear} className="px-3 py-1 bg-[var(--border)] rounded">
          Clear
        </button>
      </div>
    </div>
  )
}
