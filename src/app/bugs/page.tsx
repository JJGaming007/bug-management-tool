// src/app/bugs/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useBugs } from '@/hooks/useBugs'
import { Filters } from '@/components/bugs/Filters'
import { IssueCard } from '@/components/bugs/IssueCard'
import { BulkActions } from '@/components/bugs/BulkActions'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { NewBugModal } from '@/components/bugs/NewBugModal'
import { supabase } from '@/lib/supabase/client'
import type { Bug } from '@/types'

export default function BugsPage() {
  const { data: bugs = [], isLoading, error, refetch } = useBugs()

  const [filters, setFilters] = useState({
    status: { open: true, in_progress: true, closed: true },
  })

  // Multi-select state (if you still have bulk actions)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const toggleSelect = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  const clearSelection = () => setSelectedIds([])

  // Modal state
  const [isModalOpen, setModalOpen] = useState(false)

  // When a new bug is created, close modal and refetch
  const handleCreated = (newBug: Bug) => {
    setModalOpen(false)
    refetch()
  }

  // Bulk actions (if any)
  const bulkChangeStatus = async (newStatus: 'Open' | 'In Progress' | 'Closed') => {
    await supabase.from('bugs').update({ status: newStatus }).in('id', selectedIds)
    clearSelection()
    refetch()
  }
  const bulkDelete = async () => {
    await supabase.from('bugs').delete().in('id', selectedIds)
    clearSelection()
    refetch()
  }

  // Apply status filters
  const filtered = bugs.filter((b) => {
    const key = (b.status as string).toLowerCase().replace(/\s+/g, '_') as
      | 'open'
      | 'in_progress'
      | 'closed'
    return filters.status[key]
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center mt-10 text-red-600">Error: {error.message}</div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <Breadcrumbs />

      <div className="flex items-center justify-between px-4 py-2">
        <h1 className="text-2xl font-semibold">Bugs</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-[var(--accent)] text-black rounded hover:bg-[var(--accent-hover)]"
        >
          + New Issue
        </button>
      </div>

      {selectedIds.length > 0 && (
        <BulkActions
          selectedCount={selectedIds.length}
          onClear={clearSelection}
          onChangeStatus={bulkChangeStatus}
          onDelete={bulkDelete}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        <Filters filters={filters} onChange={setFilters} />

        <div className="flex-1 overflow-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
          {filtered.map((bug) => (
            <IssueCard
              key={bug.id}
              bug={bug}
              isSelected={selectedIds.includes(bug.id)}
              onToggleSelect={toggleSelect}
            />
          ))}
        </div>
      </div>

      <NewBugModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  )
}
