'use client'
import { FC } from 'react'
import type { Bug } from '@/types'

interface ExportCSVProps {
  bugs: Bug[]
}

export const ExportCSV: FC<ExportCSVProps> = ({ bugs }) => {
  const handleExport = () => {
    // Build CSV rows
    const header = ['ID', 'Title', 'Status', 'Priority', 'Assignee', 'Created At']
    const rows = bugs.map((b) => [
      b.id,
      b.title,
      b.status,
      b.priority,
      b.assignee ?? '',
      b.created_at,
    ])

    // Quote every field, join with commas & newlines
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${v.toString().replace(/"/g, '""')}"`).join(','))
      .join('\n')

    // Download
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bugs.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 bg-[var(--accent)] text-black rounded-lg hover:bg-[var(--accent-hover)]"
    >
      Export CSV
    </button>
  )
}
