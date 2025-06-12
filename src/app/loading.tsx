// src/app/loading.tsx
export default function GlobalLoading() {
  return (
    <div className="flex items-center justify-center h-screen bg-[var(--bg)]">
      <div className="animate-pulse p-6 bg-[var(--card)] rounded-lg shadow text-center">
        <div className="h-6 bg-[var(--border)] rounded w-32 mb-4"></div>
        <div className="h-4 bg-[var(--border)] rounded w-48 mx-auto"></div>
      </div>
    </div>
  )
}
