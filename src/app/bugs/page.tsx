'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import CreateBugModal from '@/components/bugs/CreateBugModal'
import type { Bug } from '@/types'

// Icons
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
)

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
)

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
)

const BugIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2l1.88 1.88" />
    <path d="M14.12 3.88 16 2" />
    <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
    <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
    <path d="M12 20v-9" />
    <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
    <path d="M6 13H2" />
    <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
    <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
    <path d="M22 13h-4" />
    <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
  </svg>
)

export default function BugsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [bugs, setBugs] = useState<Bug[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')

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
    } catch (ex: unknown) {
      const errorMessage = ex instanceof Error ? ex.message : 'Failed to load bugs'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const filteredBugs = bugs.filter((bug) => {
    const matchesSearch =
      !searchQuery ||
      (bug.title ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bug.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === 'All' || (bug.status ?? '').toLowerCase().includes(statusFilter.toLowerCase())

    const matchesPriority =
      priorityFilter === 'All' || (bug.priority ?? '').toLowerCase() === priorityFilter.toLowerCase()

    return matchesSearch && matchesStatus && matchesPriority
  })

  function handleBugCreated(created?: Bug) {
    setModalOpen(false)
    if (created?.id) {
      router.push(`/bugs/${created.id}`)
    } else {
      fetchBugs()
    }
  }

  const getStatusBadgeClass = (status?: string) => {
    const s = (status || '').toLowerCase()
    if (s.includes('open')) return 'badge-open'
    if (s.includes('progress')) return 'badge-progress'
    if (s.includes('resolved')) return 'badge-resolved'
    if (s.includes('closed')) return 'badge-closed'
    return 'badge-open'
  }

  const getPriorityBadgeClass = (priority?: string) => {
    const p = (priority || '').toLowerCase()
    if (p === 'critical') return 'badge-priority-critical'
    if (p === 'high') return 'badge-priority-high'
    if (p === 'medium') return 'badge-priority-medium'
    return 'badge-priority-low'
  }

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Bugs</h1>
          <p className="page-subtitle">Track and manage bugs across your projects</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <PlusIcon />
          <span>New Bug</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '320px' }}>
              <SearchIcon />
              <input
                type="text"
                className="input"
                placeholder="Search bugs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '36px' }}
              />
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <SearchIcon />
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FilterIcon />
              <select
                className="input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: 'auto', minWidth: '140px' }}
              >
                <option value="All">All Status</option>
                <option value="Open">Open</option>
                <option value="Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>

              <select
                className="input"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                style={{ width: 'auto', minWidth: '140px' }}
              >
                <option value="All">All Priority</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--text-muted)' }}>
              {filteredBugs.length} of {bugs.length} bugs
            </div>
          </div>
        </div>
      </div>

      {/* Bug List */}
      <div className="card">
        {loading ? (
          <div className="card-body">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton" style={{ height: '80px', marginBottom: '12px' }} />
            ))}
          </div>
        ) : error ? (
          <div className="card-body">
            <div className="alert alert-error">{error}</div>
          </div>
        ) : filteredBugs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <BugIcon />
            </div>
            <div className="empty-state-title">
              {searchQuery || statusFilter !== 'All' || priorityFilter !== 'All'
                ? 'No bugs match your filters'
                : 'No bugs yet'}
            </div>
            <div className="empty-state-description">
              {searchQuery || statusFilter !== 'All' || priorityFilter !== 'All'
                ? 'Try adjusting your filters'
                : 'Create your first bug to get started tracking issues'}
            </div>
            {!searchQuery && statusFilter === 'All' && priorityFilter === 'All' && (
              <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
                <PlusIcon />
                <span>Create Bug</span>
              </button>
            )}
          </div>
        ) : (
          <div style={{ padding: 0 }}>
            {filteredBugs.map((bug, index) => (
              <Link
                key={bug.id}
                href={`/bugs/${bug.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  padding: '16px 20px',
                  borderBottom: index < filteredBugs.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  transition: 'background 0.15s ease',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-1)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{bug.title || 'Untitled'}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>#{String(bug.id).slice(-6)}</span>
                  </div>
                  <p style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    marginBottom: '10px',
                    lineHeight: '1.5',
                  }}>
                    {bug.description || 'No description provided.'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span>Created {formatDate(bug.created_at)}</span>
                    {bug.assignee && <span>Assigned to {bug.assignee}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                  <span className={`badge ${getStatusBadgeClass(bug.status)}`}>{bug.status || 'Open'}</span>
                  <span className={`badge ${getPriorityBadgeClass(bug.priority)}`}>{bug.priority || 'Medium'}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Bug Modal */}
      <CreateBugModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onCreated={handleBugCreated} />
    </div>
  )
}
