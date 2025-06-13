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
import { supabase } from '@/lib/supabase/client'

export default function BugsPage() {
  const { data: bugs = [], isLoading, error, refetch } = useBugs()

  const [filters, setFilters] = useState({
    status: { open: true, in_progress: true, closed: true },
  })

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const clearSelection = () => setSelectedIds([])

  const bulkChangeStatus = async (newStatus: 'Open' | 'In Progress' | 'Closed') => {
    await supabase
      .from('bugs')
      .update({ status: newStatus })
      .in('id', selectedIds)
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
    const key = (b.status as string)
      .toLowerCase()
      .replace(/\s+/g, '_') as keyof typeof filters.status
    return filters.status[key]
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 items-stretch">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center mt-10 text-red-600">
        Error: {error.message}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <Breadcrumbs />

      {selectedIds.length > 0 && (
        <BulkActions
          selectedCount={selectedIds.length}
          onClear={clearSelection}
          onChangeStatus={bulkChangeStatus}
          onDelete={bulkDelete}
        />
      )}

      <div className="flex flex-1">
        <Filters filters={filters} onChange={setFilters} />

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 items-stretch">
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
    </div>
  )
}
