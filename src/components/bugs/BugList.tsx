// src/components/bugs/BugList.tsx
'use client'

import { FC, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import type { Bug } from '@/types'

interface BugListProps {
  bugs: Bug[]
}

export const BugList: FC<BugListProps> = ({ bugs }) => {
  useAuth()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filtered, setFiltered] = useState<Bug[]>([])

  useEffect(() => {
    setFiltered(
      search
        ? bugs.filter((b) =>
            b.title.toLowerCase().includes(search.toLowerCase())
          )
        : bugs
    )
  }, [search, bugs])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="text"
          className="px-3 py-2 border rounded-lg flex-1"
          placeholder="Search bugs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((bug) => (
            <div
              key={bug.id}
              onClick={() => router.push(`/bugs/${bug.id}`)}
              className="cursor-pointer bg-[var(--card-bg)] p-4 rounded-2xl shadow hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-semibold">{bug.title}</h3>
                <span
                  className={`px-2 py-1 text-sm font-medium rounded ${
                    bug.status === 'open'
                      ? 'bg-green-100 text-green-800'
                      : bug.status === 'in-progress'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {bug.status.replace('-', ' ')}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                {bug.description}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No bugs found.</p>
      )}
    </div>
  )
}
