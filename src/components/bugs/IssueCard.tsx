// src/components/bugs/IssueCard.tsx
'use client'

import { FC } from 'react'
import type { definitions as DB } from '@/types/database'
import { SubtasksList } from '@/components/bugs/SubtasksList'

type Bug = DB['bugs']

interface IssueCardProps {
  bug: Bug
  isSelected?: boolean
  onToggleSelect?: (id: string) => void
}

export const IssueCard: FC<IssueCardProps> = ({
  bug,
  isSelected = false,
  onToggleSelect,
}) => {
  const createdDate = bug.created_at.slice(0, 10)

  return (
    <div
      className="relative bg-[var(--card)] border border-[var(--border)] p-4 pt-8 rounded 
                 flex flex-col justify-between hover:shadow-md transition-shadow 
                 cursor-pointer h-full"
    >
      {onToggleSelect && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(bug.id)}
          className="absolute top-2 left-2 w-4 h-4"
        />
      )}

      <div>
        <div className="flex justify-between items-start">
          <div>
            <div className="text-sm uppercase text-[var(--subtext)]">
              {bug.issue_type}
            </div>
            <h3 className="text-lg font-semibold text-[var(--text)]">
              {bug.title}
            </h3>
          </div>
          <div className="text-sm font-bold text-[var(--text)]">
            {bug.story_points ?? '—'}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-sm text-[var(--subtext)]">
          <span>#{bug.id}</span>
          <span>{createdDate}</span>
        </div>

        {bug.epic_id && (
          <div className="mt-3 text-sm text-[var(--accent)]">
            Epic: {bug.epic_id}
          </div>
        )}

        <div className="mt-2 flex flex-wrap gap-1">
          {(bug.labels || []).map((lbl) => (
            <span
              key={lbl}
              className="px-2 py-0.5 bg-[var(--accent)] bg-opacity-20 
                         text-[var(--accent)] rounded"
            >
              {lbl}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center">
        {bug.assignee ? (
          <div className="w-6 h-6 rounded-full bg-[var(--border)] 
                          flex items-center justify-center text-xs text-[var(--text)]">
            {bug.assignee.charAt(0).toUpperCase()}
          </div>
        ) : (
          <span className="text-sm text-[var(--subtext)]">Unassigned</span>
        )}
        <SubtasksList parentId={bug.id} />
      </div>
    </div>
  )
}
