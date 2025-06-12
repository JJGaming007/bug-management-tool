// src/app/error.tsx
'use client'

import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex items-center justify-center h-screen bg-[var(--bg)]">
      <div className="p-6 bg-[var(--card)] rounded-lg shadow text-center space-y-4">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-[var(--subtext)]">{error.message}</p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-[var(--accent)] text-black rounded-lg hover:bg-[var(--accent-hover)]"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
