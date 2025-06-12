// src/components/skeleton/IssueCardSkeleton.tsx
export function IssueCardSkeleton() {
  return (
    <div className="card animate-pulse space-y-4">
      <div className="h-4 bg-[var(--border)] rounded w-1/2"></div>
      <div className="h-6 bg-[var(--border)] rounded w-3/4"></div>
      <div className="h-4 bg-[var(--border)] rounded w-1/4"></div>
      <div className="flex space-x-2">
        <span className="h-6 w-6 bg-[var(--border)] rounded-full"></span>
        <span className="h-4 bg-[var(--border)] rounded w-1/3"></span>
      </div>
    </div>
  )
}
