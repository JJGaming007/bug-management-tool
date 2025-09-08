// src/app/bugs/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import CreateBugModal from '@/components/bugs/CreateBugModal'
import type { Bug } from '@/types'

export default function BugsPage() {
  const router = useRouter()
  const [bugs, setBugs] = useState<Bug[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    fetchBugs()
  }, [])

  // Debug logging
  useEffect(() => {
    console.log('modalOpen state changed:', modalOpen)
  }, [modalOpen])

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
      (bug.title ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bug.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'All' ||
      (bug.status ?? '').toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  function handleOpenModal() {
    console.log('New Bug button clicked!')
    setModalOpen(true)
    console.log('modalOpen set to:', true)
  }

  function handleCloseModal() {
    console.log('Closing modal')
    setModalOpen(false)
  }

  function handleBugCreated(created?: Bug) {
    console.log('Bug created:', created)
    setModalOpen(false)
    if (created?.id) {
      router.push(`/bugs/${created.id}`)
    } else {
      fetchBugs()
    }
  }

  return (
    <div className="min-h-screen">
      <div className="content max-w-6xl mx-auto px-6 py-8">
        {/* header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Bugs</h1>
            <p className="text-sm text-slate-400 mt-1">Track issues, bugs and tasks — click any bug to open its detail page.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleOpenModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium shadow hover:opacity-95 transition"
              aria-label="Create new bug"
            >
              + New Bug
            </button>
          </div>
        </div>

        {/* Debug info */}
        <div className="mb-4 p-2 bg-blue-900/20 border border-blue-800 text-blue-200 rounded text-sm">
          Debug: modalOpen = {String(modalOpen)}
        </div>

        {/* filters */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bugs..."
                className="w-64 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 placeholder:text-slate-400 text-slate-200 text-sm focus:outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-sm"
            >
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="text-sm text-slate-400 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
            {filteredBugs.length} of {bugs.length} bug{bugs.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* main list card */}
        <div className="list-card">
          {loading ? (
            <div className="p-12 text-center text-sm text-slate-400">Loading bugs…</div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-4 inline-block">
                Error: {error}
              </div>
            </div>
          ) : filteredBugs.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              {searchQuery || statusFilter !== 'All' ? 'No bugs match your filters' : 'No bugs found'}
            </div>
          ) : (
            <div className="content">
              <div className="bug-list">
                {filteredBugs.map((bug) => (
                  <Link
                    key={bug.id}
                    href={`/bugs/${bug.id}`}
                    className="bug-card hover:shadow-lg transition-shadow duration-150"
                  >
                    <div className="left">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <h3 className="bug-title">{bug.title || 'Untitled'}</h3>
                        <div className="bug-id text-slate-400 text-xs">#{String(bug.id).slice(-6)}</div>
                      </div>

                      <div className="bug-sub mt-2">
                        <div className="meta-small text-slate-400">Created {formatDate(bug.created_at)}</div>
                        {bug.due_date && <div className="meta-small text-slate-400">Due {formatDate(bug.due_date)}</div>}
                        {bug.reporter && <div className="meta-small text-slate-400">by {shortenReporter(bug.reporter)}</div>}
                      </div>

                      <p className="bug-excerpt mt-3">
                        {bug.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="bug-meta">
                      <div className={`badge ${statusToClass(bug.status)}`}>{bug.status || 'Unknown'}</div>
                      <div className="meta-row chip">{(bug as any).priority ?? 'Normal'}</div>
                      <div className="meta-row muted text-slate-400">{formatDate(bug.created_at)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <CreateBugModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onCreated={handleBugCreated}
      />
    </div>
  )
}

/* helpers */
function statusToClass(status?: string) {
  const s = (status || '').toLowerCase()
  if (s.includes('open')) return 'status-new'
  if (s.includes('in') || s.includes('progress')) return 'status-progress'
  if (s.includes('resolved')) return 'status-resolved'
  if (s.includes('closed')) return 'status-closed'
  return ''
}

function shortenReporter(r?: string) {
  if (!r) return ''
  return r.length > 20 ? r.slice(0, 18) + '…' : r
}

function formatDate(value: any) {
  if (!value) return ''
  try {
    const d = new Date(value)
    return d.toLocaleDateString() + (d.toLocaleTimeString ? ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')
  } catch {
    return String(value)
  }
}