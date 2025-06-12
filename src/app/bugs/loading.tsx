// src/app/bugs/loading.tsx
import { IssueCardSkeleton } from '@/components/skeleton/IssueCardSkeleton'

export default function BugsLoading() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 bg-[var(--border)] rounded w-40 animate-pulse"></div>
        <div className="h-8 bg-[var(--border)] rounded w-24 animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <IssueCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
