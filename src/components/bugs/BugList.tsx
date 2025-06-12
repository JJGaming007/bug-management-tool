'use client'
import { FC, useEffect, useState } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import { SaveFilter } from '@/components/bugs/SaveFilter'
import { AssignBug } from '@/components/bugs/AssignBug'
import { CommentList } from '@/components/bugs/CommentList'
import { CommentForm } from '@/components/bugs/CommentForm'
import { Timeline } from '@/components/bugs/Timeline'
import type { Bug } from '@/types'

export const BugList: FC<{ bugs: Bug[] }> = ({ bugs }) => {
  // (You can remove useAuth entirely if you don't need login gating)
  const { user } = useAuth()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [priorityFilter, setPriorityFilter] = useState<string[]>([])
  const [filteredBugs, setFilteredBugs] = useState<Bug[]>(bugs)

  // Apply a saved filter set
  const applySaved = (f: { search: string; status: string[]; priority: string[] }) => {
    setSearch(f.search)
    setStatusFilter(f.status)
    setPriorityFilter(f.priority)
  }

  // Recompute filteredBugs whenever inputs change
  useEffect(() => {
    let result = bugs
    if (search) {
      const term = search.toLowerCase()
      result = result.filter(
        (b) => b.title.toLowerCase().includes(term) || b.description.toLowerCase().includes(term),
      )
    }
    if (statusFilter.length) {
      result = result.filter((b) => statusFilter.includes(b.status))
    }
    if (priorityFilter.length) {
      result = result.filter((b) => priorityFilter.includes(b.priority))
    }
    setFilteredBugs(result)
  }, [bugs, search, statusFilter, priorityFilter])

  // toggle helper
  const toggle = (arr: string[], setter: (newArr: string[]) => void, value: string) => {
    setter(arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value])
  }

  return (
    <div className="p-4 space-y-6">
      {/* 1. Saved Filters UI (always visible for now) */}
      <SaveFilter
        search={search}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        onApply={applySaved}
      />

      {/* 2. Manual Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <input
          type="text"
          placeholder="Search bugs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-1 border rounded-lg"
        />

        {/* Status buttons */}
        {['open', 'in-progress', 'closed'].map((s) => (
          <button
            key={s}
            onClick={() => toggle(statusFilter, setStatusFilter, s)}
            className={`px-2 py-1 mr-1 rounded-lg ${
              statusFilter.includes(s) ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            {s}
          </button>
        ))}

        {/* Priority buttons */}
        {['low', 'medium', 'high'].map((p) => (
          <button
            key={p}
            onClick={() => toggle(priorityFilter, setPriorityFilter, p)}
            className={`px-2 py-1 mr-1 rounded-lg ${
              priorityFilter.includes(p) ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* 3. Bug Cards */}
      {filteredBugs.length > 0 ? (
        filteredBugs.map((bug) => (
          <div key={bug.id} className="bg-[var(--card-bg)] p-4 rounded-2xl shadow space-y-3">
            <h3 className="text-xl font-semibold">{bug.title}</h3>
            <p className="text-gray-700 dark:text-gray-300">{bug.description}</p>
            <AssignBug bugId={bug.id} currentAssignee={bug.assignee} />
            <CommentList bugId={bug.id} />
            <CommentForm bugId={bug.id} />
            <Timeline bugId={bug.id} />
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 mt-10">No bugs found.</p>
      )}
    </div>
  )
}
