'use client'

import React, { useCallback } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { useRouter } from 'next/navigation'

interface Bug {
  id: string | number
  title: string
  status?: string | null
  priority?: string | null
  assignee?: string | null
  created_at?: string
}

interface Status {
  key: string
  label: string
  color: string
}

const ITEM_TYPE = 'KANBAN_CARD'

const defaultStatuses: Status[] = [
  { key: 'open', label: 'Open', color: '#f97316' },
  { key: 'in_progress', label: 'In Progress', color: '#3b82f6' },
  { key: 'resolved', label: 'Resolved', color: '#22c55e' },
  { key: 'closed', label: 'Closed', color: '#64748b' },
]

interface KanbanBoardProps {
  bugs?: Bug[] | null
  statuses?: Status[]
  onStatusChange?: (id: string | number, toStatus: string) => Promise<void> | void
}

export default function KanbanBoard({
  bugs = [],
  statuses = defaultStatuses,
  onStatusChange,
}: KanbanBoardProps) {
  const list = Array.isArray(bugs) ? bugs : []

  const handleDrop = useCallback(
    async (bugId: string | number, newStatus: string) => {
      if (onStatusChange) {
        await onStatusChange(bugId, newStatus)
      }
    },
    [onStatusChange]
  )

  if (!list.length) {
    return (
      <div className="empty-state" style={{ minHeight: '400px' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18" />
          <path d="M15 3v18" />
        </svg>
        <div className="empty-state-title">No bugs to display</div>
        <div className="empty-state-description">
          Create some bugs to see them on the board
        </div>
      </div>
    )
  }

  return (
    <div className="kanban-container">
      {statuses.map((status) => (
        <KanbanColumn
          key={status.key}
          status={status}
          bugs={list.filter((b) => normalizeStatus(b.status) === status.key)}
          onDrop={handleDrop}
        />
      ))}
    </div>
  )
}

function normalizeStatus(status?: string | null): string {
  const s = (status || '').toLowerCase().trim()
  if (s.includes('open') || s === '' || s === 'new' || s === 'todo') return 'open'
  if (s.includes('progress') || s === 'in-progress' || s === 'in progress') return 'in_progress'
  if (s.includes('resolved') || s === 'done' || s === 'complete') return 'resolved'
  if (s.includes('closed')) return 'closed'
  return 'open'
}

interface KanbanColumnProps {
  status: Status
  bugs: Bug[]
  onDrop: (bugId: string | number, newStatus: string) => void
}

function KanbanColumn({ status, bugs, onDrop }: KanbanColumnProps) {
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: ITEM_TYPE,
      drop: (item: { id: string | number }) => {
        onDrop(item.id, status.key)
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [status.key, onDrop]
  )

  const isActive = isOver && canDrop

  return (
    <div className="kanban-column" ref={drop as unknown as React.LegacyRef<HTMLDivElement>}>
      <div className="kanban-column-header">
        <div className="kanban-column-title">
          <div
            className="kanban-column-dot"
            style={{ backgroundColor: status.color }}
          />
          <span className="kanban-column-name">{status.label}</span>
        </div>
        <span className="kanban-column-count">{bugs.length}</span>
      </div>

      <div
        className="kanban-column-body"
        style={{
          background: isActive ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
          transition: 'background 0.2s ease',
        }}
      >
        {bugs.map((bug) => (
          <KanbanCard key={bug.id} bug={bug} />
        ))}
        {bugs.length === 0 && (
          <div
            className="kanban-drop-zone"
            style={{
              borderColor: isActive ? 'var(--accent-primary)' : 'var(--border-subtle)',
              background: isActive ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
            }}
          >
            Drop here
          </div>
        )}
      </div>
    </div>
  )
}

interface KanbanCardProps {
  bug: Bug
}

function KanbanCard({ bug }: KanbanCardProps) {
  const router = useRouter()

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ITEM_TYPE,
      item: { id: bug.id },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [bug.id]
  )

  const getPriorityColor = (priority?: string | null) => {
    const p = (priority || '').toLowerCase()
    if (p === 'critical') return '#ef4444'
    if (p === 'high') return '#f97316'
    if (p === 'medium') return '#eab308'
    return '#6b7280'
  }

  const getInitials = (name?: string | null) => {
    if (!name) return '?'
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div
      ref={drag as unknown as React.LegacyRef<HTMLDivElement>}
      className={`kanban-card ${isDragging ? 'dragging' : ''}`}
      onClick={() => router.push(`/bugs/${bug.id}`)}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      <div className="kanban-card-title">{bug.title}</div>
      <div className="kanban-card-meta">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="kanban-card-id">#{String(bug.id).slice(-6)}</span>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: getPriorityColor(bug.priority),
            }}
            title={`Priority: ${bug.priority || 'Medium'}`}
          />
        </div>
        {bug.assignee && (
          <div
            className="kanban-card-avatar"
            title={bug.assignee}
            style={{
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            }}
          >
            {getInitials(bug.assignee)}
          </div>
        )}
      </div>
    </div>
  )
}
