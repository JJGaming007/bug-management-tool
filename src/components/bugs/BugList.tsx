// src/components/bugs/BugList.tsx
'use client'

import React, { FC, useEffect, useMemo, useState } from 'react'
import type { Bug } from '@/types'

interface BugListProps {
  bugs?: Bug[] | null
  search?: string
}

const BugList: FC<BugListProps> = ({ bugs = [], search = '' }) => {
  const [query, setQuery] = useState<string>(search || '')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null)

  // ensure bugs is always an array
  const safeBugs = Array.isArray(bugs) ? bugs : []

  useEffect(() => {
    setQuery(search || '')
  }, [search])

  const filtered = useMemo(() => {
    let list = safeBugs

    if (statusFilter !== 'all') {
      list = list.filter((b) => String(b.status || '').toLowerCase() === statusFilter.toLowerCase())
    }

    const q = (query || '').trim().toLowerCase()
    if (q) {
      list = list.filter(
        (b) =>
          String(b.title ?? '').toLowerCase().includes(q) ||
          String(b.description ?? '').toLowerCase().includes(q) ||
          (Array.isArray(b.labels) && b.labels.join(' ').toLowerCase().includes(q))
      )
    }

    return list
  }, [safeBugs, statusFilter, query])

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search bugs…"
            className="px-3 py-2 border rounded-lg bg-white/5"
            aria-label="Search bugs"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2 py-1 border rounded bg-white/5"
            aria-label="Filter by status"
          >
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="text-sm text-gray-400">
          {filtered.length ? `${filtered.length} bug${filtered.length > 1 ? 's' : ''}` : 'No matching bugs'}
        </div>
      </div>

      {filtered.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((bug) => (
            <article
              key={bug.id}
              onClick={() => setSelectedBug(bug)}
              className="p-4 border rounded-lg shadow-sm bg-white/5 cursor-pointer hover:bg-white/10 transition"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setSelectedBug(bug)
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-sm">{bug.title}</h4>
                  <p className="text-xs text-gray-400 mt-1">{bug.reporter_id ?? ''}</p>
                </div>
                <span
                  className="text-xs px-2 py-1 rounded text-white"
                  style={{ backgroundColor: getStatusColor(bug.status) }}
                >
                  {bug.status}
                </span>
              </div>

              {bug.description && (
                <p className="text-sm text-gray-300 mt-3 line-clamp-3">{bug.description}</p>
              )}

              {Array.isArray(bug.labels) && bug.labels.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {bug.labels.map((l: string, idx: number) => (
                    <span key={idx} className="text-xs px-2 py-1 rounded border bg-white/5">
                      {l}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-sm text-gray-500">No bugs to show.</div>
      )}

      {/* Detail modal */}
      {selectedBug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl overflow-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold">{selectedBug.title}</h3>
              <button
                onClick={() => setSelectedBug(null)}
                className="text-sm px-3 py-1 rounded border hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Close
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <div className="text-xs text-gray-400">Status</div>
                <div className="mt-1 inline-block px-2 py-1 rounded text-white" style={{ backgroundColor: getStatusColor(selectedBug.status) }}>
                  {selectedBug.status}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-400">Reporter</div>
                <div className="mt-1">{selectedBug.reporter_id ?? '—'}</div>
              </div>

              <div>
                <div className="text-xs text-gray-400">Description</div>
                <div className="mt-2 whitespace-pre-wrap text-sm text-gray-200">{selectedBug.description || 'No description'}</div>
              </div>

              {Array.isArray(selectedBug.labels) && selectedBug.labels.length > 0 && (
                <div>
                  <div className="text-xs text-gray-400">Labels</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedBug.labels.map((l: string, idx: number) => (
                      <span key={idx} className="text-xs px-2 py-1 rounded border bg-white/5">
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t dark:border-gray-700 flex justify-end gap-3">
              <button className="px-3 py-2 rounded border" onClick={() => setSelectedBug(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BugList

function getStatusColor(status?: string) {
  const s = (status || '').toLowerCase()
  if (s.includes('new')) return '#ef4444' // red
  if (s.includes('in') || s.includes('progress')) return '#f59e0b' // amber
  if (s.includes('resolved')) return '#10b981' // green
  if (s.includes('closed')) return '#6b7280' // gray
  return '#374151' // default
}
