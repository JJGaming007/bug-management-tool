'use client'

import Link from 'next/link'
import { FC } from 'react'

// Shape of each bug—adjust these fields to match your DB type
interface Bug {
  id: string
  title: string
  created_at: string
}

interface RecentBugsProps {
  bugs: Bug[]
}

export const RecentBugs: FC<RecentBugsProps> = ({ bugs }) => {
  if (bugs.length === 0) {
    return <p className="text-[var(--subtext)]">No recent bugs.</p>
  }

  return (
    <ul className="space-y-3">
      {bugs.map((bug) => (
        <li
          key={bug.id}
          className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-3 hover:bg-[var(--border)] transition"
        >
          <Link href={`/bugs/${bug.id}`} className="block">
            <h3 className="font-medium text-[var(--text)]">{bug.title}</h3>
            <p className="text-sm text-[var(--subtext)] mt-1">
              {new Date(bug.created_at).toLocaleDateString()}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  )
}
