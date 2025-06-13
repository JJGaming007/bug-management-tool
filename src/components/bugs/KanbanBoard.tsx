'use client'
import { FC } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import type { Bug } from '@/types'
import { IssueCard } from './IssueCard'

interface Props {
  bugs: Bug[]
  onStatusChange: (id: number, status: Bug['status']) => void
}

const statuses = [
  { key: 'open', title: 'To Do' },
  { key: 'in-progress', title: 'In Progress' },
  { key: 'closed', title: 'Done' },
] as const

const Card: FC<{ bug: Bug }> = ({ bug }) => {
  const [, drag] = useDrag(() => ({ type: 'BUG', item: { id: bug.id } }))
  return (
    <div
      ref={(node) => {
        drag(node)
      }}
    >
      <IssueCard bug={bug} />
    </div>
  )
}

const Column: FC<{
  status: (typeof statuses)[number]
  bugs: Bug[]
  onDrop: (id: number) => void
}> = ({ status, bugs, onDrop }) => {
  const [, drop] = useDrop(() => ({
    accept: 'BUG',
    drop: (item: any) => onDrop(item.id),
  }))
  return (
    <div
      ref={(node) => {
        drop(node)
      }}
      className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded p-4 space-y-4"
    >
      <h4 className="font-semibold mb-2">
        {status.title} ({bugs.length})
      </h4>
      {bugs.map((b) => (
        <Card key={b.id} bug={b} />
      ))}
    </div>
  )
}

export const KanbanBoard: FC<Props> = ({ bugs, onStatusChange }) => (
  <DndProvider backend={HTML5Backend}>
    <div className="flex gap-4 overflow-auto">
      {statuses.map((s) => (
        <Column
          key={s.key}
          status={s}
          bugs={bugs.filter((b) => b.status === s.key)}
          onDrop={(id) => onStatusChange(id, s.key)}
        />
      ))}
    </div>
  </DndProvider>
)
