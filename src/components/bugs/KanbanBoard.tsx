// src/components/bugs/KanbanBoard.tsx
'use client'

import React from 'react'
import type { MouseEvent } from 'react'

type Bug = {
  id: string | number
  title: string
  status?: string | null
  priority?: string | null
  assignee?: string | null
  created_at?: string
}

type Status = { key: string; label: string; color?: string }

export default function KanbanBoard({
  bugs = [], // << safe default: never undefined
  statuses = [
    { key: 'open', label: 'Open', color: '#f97316' },
    { key: 'in_progress', label: 'In Progress', color: '#06b6d4' },
    { key: 'resolved', label: 'Resolved', color: '#10b981' },
    { key: 'closed', label: 'Closed', color: '#94a3b8' },
  ] as Status[],
  onStatusChange = async (_id: string | number, _status: string) => {},
}: {
  bugs?: Bug[] | null
  statuses?: Status[]
  onStatusChange?: (id: string | number, toStatus: string) => Promise<void> | void
}) {
  // normalize possible null
  const list = Array.isArray(bugs) ? bugs : []

  // simple no-data state
  if (!list.length) {
    return (
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ margin: 0 }}>Kanban</h3>
        <p style={{ marginTop: 8, color: 'var(--subtext)' }}>
          There are no issues to display. Create a bug to see it appear on the board.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', overflowX: 'auto' }}>
      {statuses.map((s) => (
        <Column
          key={s.key}
          status={s}
          bugs={list.filter((b) => (b.status ?? 'open') === s.key)}
          onDropAsync={async (id) => {
            try {
              await onStatusChange(id, s.key)
            } catch (err) {
              // swallow - parent should show errors; keep UI robust
              // eslint-disable-next-line no-console
              console.error('Failed to change status', err)
            }
          }}
        />
      ))}
    </div>
  )
}

/* ---------------------------------------
   Column subcomponent (self-contained)
   - Simple click-to-move example if you
     don't have drag-and-drop wired yet.
   - Renders cards with minimal details.
----------------------------------------*/
function Column({
  status,
  bugs,
  onDropAsync,
}: {
  status: { key: string; label: string; color?: string }
  bugs: Bug[]
  onDropAsync: (id: string | number) => Promise<void> | void
}) {
  return (
    <div
      style={{
        minWidth: 320,
        maxWidth: 360,
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700 }}>{status.label}</div>
          <div style={{ fontSize: 12, color: 'var(--subtext)' }}>{bugs.length} items</div>
        </div>
        <div style={{ width: 10, height: 10, borderRadius: 999, background: status.color ?? 'var(--accent)' }} />
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        {bugs.map((b) => (
          <BoardCard key={String(b.id)} bug={b} onMove={() => onDropAsync(b.id)} />
        ))}
        {bugs.length === 0 && (
          <div style={{ color: 'var(--subtext)', padding: 12, borderRadius: 8, background: '#071026' }}>
            No issues
          </div>
        )}
      </div>
    </div>
  )
}

/* Small card used in columns */
function BoardCard({ bug, onMove }: { bug: Bug; onMove: (e?: MouseEvent) => void }) {
  return (
    <div
      className="card"
      style={{
        padding: 10,
        cursor: 'grab',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
      // basic click handler to move card to next status if user clicks the button
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontWeight: 600 }}>{bug.title}</div>
        <div style={{ fontSize: 12, color: 'var(--subtext)' }}>#{bug.id}</div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--subtext)' }}>
        {bug.assignee ? `Assignee: ${bug.assignee}` : 'Unassigned'}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button className="btn secondary" onClick={onMove} type="button">
          Move
        </button>
      </div>
    </div>
  )
}
