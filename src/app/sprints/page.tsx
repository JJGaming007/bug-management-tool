'use client'

import React, { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface Sprint {
  id: string
  name: string
  start_date: string | null
  end_date: string | null
  status: 'planning' | 'active' | 'completed'
  created_at: string
}

// Icons
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
)

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
)

const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
)

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
)

const SprintIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 16V9h14V2" />
    <path d="M5 22v-3" />
    <path d="M19 22v-6" />
    <circle cx="5" cy="9" r="3" />
    <circle cx="19" cy="2" r="3" />
  </svg>
)

export default function SprintsPage() {
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchSprints()
  }, [])

  async function fetchSprints() {
    if (!isSupabaseConfigured) {
      setLoading(false)
      setError('Database not configured. Please set up Supabase.')
      return
    }

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('sprints')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setSprints(data || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load sprints')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Sprint name is required')
      return
    }

    setSubmitting(true)
    try {
      const { error: insertError } = await supabase
        .from('sprints')
        .insert({
          name: name.trim(),
          start_date: startDate || null,
          end_date: endDate || null,
          status: 'planning',
        })

      if (insertError) throw insertError

      toast.success('Sprint created')
      setName('')
      setStartDate('')
      setEndDate('')
      setShowForm(false)
      fetchSprints()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create sprint')
    } finally {
      setSubmitting(false)
    }
  }

  async function updateStatus(id: string, status: 'planning' | 'active' | 'completed') {
    try {
      const { error: updateError } = await supabase
        .from('sprints')
        .update({ status })
        .eq('id', id)

      if (updateError) throw updateError

      toast.success(`Sprint ${status === 'active' ? 'started' : status === 'completed' ? 'completed' : 'set to planning'}`)
      fetchSprints()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update sprint')
    }
  }

  async function deleteSprint(id: string) {
    if (!confirm('Are you sure you want to delete this sprint?')) return

    try {
      const { error: deleteError } = await supabase
        .from('sprints')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      toast.success('Sprint deleted')
      fetchSprints()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete sprint')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'badge-progress'
      case 'completed':
        return 'badge-resolved'
      default:
        return 'badge-open'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'completed':
        return 'Completed'
      default:
        return 'Planning'
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null
    const end = new Date(endDate)
    const now = new Date()
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Sprints</h1>
          <p className="page-subtitle">Manage your development sprints and iterations</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <PlusIcon />
          <span>New Sprint</span>
        </button>
      </div>

      {/* Create Sprint Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card-header">
            <span className="card-title">Create New Sprint</span>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreate}>
              <div className="input-group">
                <label className="input-label">Sprint Name *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Sprint 1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Start Date</label>
                  <input
                    type="date"
                    className="input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">End Date</label>
                  <input
                    type="date"
                    className="input"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Sprint'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sprints List */}
      <div className="card">
        {loading ? (
          <div className="card-body">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: '80px', marginBottom: '12px' }} />
            ))}
          </div>
        ) : error ? (
          <div className="card-body">
            <div className="alert alert-error">{error}</div>
          </div>
        ) : sprints.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <SprintIcon />
            </div>
            <div className="empty-state-title">No sprints yet</div>
            <div className="empty-state-description">
              Create your first sprint to start organizing your development cycles
            </div>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <PlusIcon />
              <span>Create Sprint</span>
            </button>
          </div>
        ) : (
          <div style={{ padding: 0 }}>
            {sprints.map((sprint, index) => {
              const daysRemaining = getDaysRemaining(sprint.end_date)
              return (
                <div
                  key={sprint.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderBottom: index < sprints.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '15px' }}>
                        {sprint.name}
                      </span>
                      <span className={`badge ${getStatusBadge(sprint.status)}`}>
                        {getStatusLabel(sprint.status)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CalendarIcon />
                        {formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}
                      </span>
                      {sprint.status === 'active' && daysRemaining !== null && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: daysRemaining < 3 ? 'var(--priority-critical)' : 'var(--text-muted)' }}>
                          <ClockIcon />
                          {daysRemaining > 0 ? `${daysRemaining} days remaining` : daysRemaining === 0 ? 'Ends today' : 'Overdue'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {sprint.status === 'planning' && (
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => updateStatus(sprint.id, 'active')}
                        title="Start Sprint"
                      >
                        <PlayIcon />
                        <span>Start</span>
                      </button>
                    )}
                    {sprint.status === 'active' && (
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => updateStatus(sprint.id, 'completed')}
                        title="Complete Sprint"
                      >
                        <CheckIcon />
                        <span>Complete</span>
                      </button>
                    )}
                    {sprint.status === 'completed' && (
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => updateStatus(sprint.id, 'planning')}
                        title="Reopen Sprint"
                      >
                        <ClockIcon />
                        <span>Reopen</span>
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteSprint(sprint.id)}
                      title="Delete Sprint"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
