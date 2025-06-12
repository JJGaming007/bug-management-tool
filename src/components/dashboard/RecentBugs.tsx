'use client'
import { FC } from 'react'
import type { Bug } from '@/types'

interface RecentBugsProps {
  bugs: Bug[]
  onSelect?: (bug: Bug) => void
}

export const RecentBugs: FC<RecentBugsProps> = ({ bugs, onSelect }) => {
  const recent = bugs.slice(-5).reverse()

  return (
    <ul className="space-y-2">
      {recent.map((bug) => (
        <li
          key={bug.id}
          onClick={() => onSelect?.(bug)}
          className="p-3 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
        >
          <p className="font-medium">{bug.title}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(bug.created_at).toLocaleDateString()}
          </p>
        </li>
      ))}
      {recent.length === 0 && <li className="text-center text-gray-500">No recent bugs.</li>}
    </ul>
  )
}
