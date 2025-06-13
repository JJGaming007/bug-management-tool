// src/components/ui/SkeletonCard.tsx
'use client'

export function SkeletonCard() {
  return (
    <div className="h-full p-4 bg-[var(--card)] border border-[var(--border)] rounded animate-pulse flex flex-col justify-between">
      {/* Title */}
      <div className="h-6 bg-[var(--border)] rounded w-3/4 mb-4" />

      {/* Subtitle */}
      <div className="h-4 bg-[var(--border)] rounded w-1/2 mb-4" />

      {/* Footer */}
      <div className="mt-auto h-4 bg-[var(--border)] rounded w-2/5" />
    </div>
  )
}
