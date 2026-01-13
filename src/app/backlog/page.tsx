'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { Bug } from '@/types'

// Icons
const BacklogIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="7" height="7" x="3" y="3" rx="1" />
    <rect width="7" height="7" x="3" y="14" rx="1" />
    <path d="M14 4h7" />
    <path d="M14 9h7" />
    <path d="M14 15h7" />
    <path d="M14 20h7" />
  </svg>
)

export default function BacklogPage() {
  const [bugs, setBugs] = useState<Bug[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBacklog()
  }, [])

  async function fetchBacklog() {
    if (!isSupabaseConfigured) {
      setLoading(false)
      setError('Database not configured. Please set up Supabase.')
      return
    }

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('bugs')
        .select('*')
        .is('sprint_id', null)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setBugs(data || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load backlog')
    } finally {
      setLoading(false)
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Backlog</h1>
        <p className="page-subtitle">Bugs not assigned to any sprint</p>
      </div>

      {/* Backlog List */}
      <div className="card">
        {loading ? (
          <div className="card-body">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton" style={{ height: '72px', marginBottom: '12px' }} />
            ))}
          </div>
        ) : error ? (
          <div className="card-body">
            <div className="alert alert-error">{error}</div>
          </div>
        ) : bugs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <BacklogIcon />
            </div>
            <div className="empty-state-title">Backlog is empty</div>
            <div className="empty-state-description">
              All bugs are assigned to sprints, or you haven&apos;t created any bugs yet
            </div>
          </div>
        ) : (
          <div style={{ padding: 0 }}>
            {bugs.map((bug, index) => (
              <Link
                key={bug.id}
                href={`/bugs/${bug.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  padding: '14px 20px',
                  borderBottom: index < bugs.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  transition: 'background 0.15s ease',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-1)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{bug.title || 'Untitled'}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>#{String(bug.id).slice(-6)}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Created {formatDate(bug.created_at)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <span className={`badge ${getStatusBadgeClass(bug.status)}`}>{bug.status || 'Open'}</span>
                  <span className={`badge ${getPriorityBadgeClass(bug.priority)}`}>{bug.priority || 'Medium'}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      {!loading && !error && bugs.length > 0 && (
        <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
          {bugs.length} bug{bugs.length !== 1 ? 's' : ''} in backlog
        </div>
      )}
    </div>
  )
}
