'use client'

import { useBugs } from '@/hooks/useBugs'
import { useBugStore } from '@/stores/bugStore'
import { getStatusColor,getPriorityColor } from '@/lib/utils'
import Link from 'next/link'

export function RecentBugs() {
  const { data: bugs = [], isLoading, error } = useBugs()
  const { setSelectedBug } = useBugStore()

  if (isLoading) return <p className="text-gray-500">Loading…</p>
  if (error)     return <p className="text-red-500">Error</p>

  const recent = bugs
    .slice().sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime())
    .slice(0,5)

  if (!recent.length) return <p className="text-gray-500">No recent bugs.</p>

  return (
    <ul className="divide-y divide-gray-200">
      {recent.map(bug=>(
        <li key={bug.id} className="flex justify-between items-center py-4">
          <Link
            href={`/bugs/${bug.id}`}
            onClick={()=>setSelectedBug(bug)}
            className="font-medium text-primary-600 hover:underline"
          >
            {bug.title}
          </Link>
          <div className="flex items-center gap-3 text-xs">
            <span className={`px-2 py-1 rounded ${getStatusColor(bug.status)} bg-opacity-10`}>
              {bug.status}
            </span>
            <span className={`px-2 py-1 rounded ${getPriorityColor(bug.priority)} bg-opacity-10`}>
              {bug.priority}
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}
