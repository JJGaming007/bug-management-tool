'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import CreateBugModal from '@/components/bugs/CreateBugModal'
import type { Bug } from '@/types'

export default function BugsPage() {
  const [bugs, setBugs] = useState<Bug[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    fetchBugs()
  }, [])

  async function fetchBugs() {
    try {
      setLoading(true)
      setError(null)
      const { data, error: supError } = await supabase
        .from('bugs')
        .select('*')
        .order('created_at', { ascending: false })

      if (supError) setError(supError.message)
      else setBugs((data as Bug[]) || [])
    } catch (ex: any) {
      setError(ex?.message || 'Failed to load bugs')
    } finally {
      setLoading(false)
    }
  }

  const filteredBugs = bugs.filter(bug => {
    const matchesSearch = !searchQuery ||
      bug.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bug.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'All' ||
      bug.status?.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  return (
    <div className="content">
      <h1>Bugs</h1>

      {/* Controls Card */}
      <div className="card row" style={{ gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="row" style={{ gap: 12 }}>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="btn primary"
          >
            + New Bug
          </button>

          <input
            type="text"
            placeholder="Search bugs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div className="text-sm text-gray-400">
          {filteredBugs.length} of {bugs.length} bug{bugs.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* List Card */}
      <div className="card">
        {loading ? (
          <div>Loading bugs...</div>
        ) : error ? (
          <div className="text-red-500">Error: {error}</div>
        ) : filteredBugs.length === 0 ? (
          <div>No bugs found</div>
        ) : (
          <ul className="col" style={{ gap: 12 }}>
            {filteredBugs.map((bug) => (
              <li key={bug.id} className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="col" style={{ gap: 4 }}>
                  <Link href={`/bugs/${bug.id}`} className="text-link">
                    <strong>{bug.title}</strong>
                  </Link>
                  <span className="text-sm text-gray-500">{bug.description || 'No description provided.'}</span>
                  <div className="row" style={{ gap: 8 }}>
                    {Array.isArray(bug.labels) && bug.labels.slice(0, 3).map((label, i) => (
                      <span key={i} className="tag">{label}</span>
                    ))}
                  </div>
                </div>
                <div className="col" style={{ gap: 4, alignItems: 'flex-end' }}>
                  <span className="tag">{bug.status}</span>
                  <span className="text-sm text-gray-400">{formatDate(bug.created_at)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <CreateBugModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => {
          fetchBugs()
          setModalOpen(false)
        }}
      />
    </div>
  )
}

function formatDate(value: any) {
  if (!value) return ''
  try {
    const d = new Date(value)
    return d.toLocaleDateString()
  } catch {
    return String(value)
  }
}
