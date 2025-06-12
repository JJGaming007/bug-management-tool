// src/app/bugs/[id]/not-found.tsx
import Link from 'next/link'

export default function BugNotFound() {
  return (
    <div className="flex items-center justify-center h-screen bg-[var(--bg)]">
      <div className="p-6 bg-[var(--card)] rounded-lg shadow text-center space-y-4">
        <h1 className="text-2xl font-semibold">Issue not found</h1>
        <p className="text-[var(--subtext)]">We couldn’t find that issue.</p>
        <Link
          href="/bugs"
          className="px-4 py-2 bg-[var(--accent)] text-black rounded-lg hover:bg-[var(--accent-hover)]"
        >
          Back to Issues
        </Link>
      </div>
    </div>
  )
}
