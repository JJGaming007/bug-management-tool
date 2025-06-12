'use client'

import { Filter, Search, XCircle } from 'lucide-react'

type Props = {
  search: string
  setSearch: (v: string) => void
  status: string
  setStatus: (v: string) => void
  priority: string
  setPriority: (v: string) => void
  onClear: () => void
}

export function BugFilters({
  search,
  setSearch,
  status,
  setStatus,
  priority,
  setPriority,
  onClear,
}: Props) {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row items-stretch gap-4 bg-white dark:bg-gray-800 shadow rounded-xl p-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search bugs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-300 outline-none transition"
          />
        </div>
        {/* Status */}
        <div className="relative w-40">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-300 outline-none"
          >
            <option value="">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
        {/* Priority */}
        <div className="relative w-40">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-300 outline-none"
          >
            <option value="">All Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
        {/* Clear */}
        <button
          onClick={onClear}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-200 transition"
        >
          <XCircle className="w-5 h-5" />
          Clear
        </button>
      </div>
    </div>
  )
}
