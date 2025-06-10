'use client'

import { useBugs } from '@/hooks/useBugs'

export function DashboardStats({
  stat,
}: {
  stat: 'total' | 'open' | 'resolved' | 'critical'
}) {
  const { data: bugs = [], isLoading, error } = useBugs()

  if (isLoading) return <p className="text-gray-500">Loading…</p>
  if (error)     return <p className="text-red-500">Error</p>

  let label: string, value: number, color: string

  switch (stat) {
    case 'total':
      label = 'Total Bugs';    value = bugs.length;                         color = 'text-primary-600 ring-primary-100'; break
    case 'open':
      label = 'Open Bugs';     value = bugs.filter((b) => b.status==='Open').length;     color = 'text-yellow-500 ring-yellow-100';  break
    case 'resolved':
      label = 'Resolved Bugs'; value = bugs.filter((b) => b.status==='Resolved').length; color = 'text-green-600 ring-green-100';  break
    case 'critical':
      label = 'Critical Bugs'; value = bugs.filter((b) => b.priority==='Critical').length; color = 'text-red-600 ring-red-100';    break
  }

  return (
    <div className="text-center">
      <span className="block text-sm text-gray-500">{label}</span>
      <span className={`mt-2 inline-block px-3 py-1 font-semibold bg-opacity-10 rounded-full ring ${color}`}>
        {value}
      </span>
    </div>
  )
}
