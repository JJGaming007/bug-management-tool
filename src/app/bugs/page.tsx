'use client'

import { useBugs } from '@/hooks/useBugs'
import Link from 'next/link'
import { IssueCard } from '@/components/bugs/IssueCard'

export default function BugsPage() {
  const { data: bugs, isLoading, error } = useBugs()

  if (isLoading) {
    return <div className="text-center mt-10">Loading issues…</div>
  }
  if (error) {
    return <div className="text-center mt-10 text-red-600">Error: {error.message}</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Issues</h1>
        <Link
          href="/bugs/new"
          className="px-4 py-2 bg-[var(--accent)] text-black rounded-lg hover:bg-[var(--accent-hover)]"
        >
          + New Issue
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {bugs!.map((bug) => (
          <Link key={bug.id} href={`/bugs/${bug.id}`}>
            <IssueCard bug={bug} />
          </Link>
        ))}
      </div>
    </div>
  )
}
