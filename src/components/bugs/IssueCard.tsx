'use client'

import { FC } from 'react'
import type { Bug } from '@/types'
import { SubtasksList } from '@/components/bugs/SubtasksList'

interface IssueCardProps {
  bug: Bug
}

export const IssueCard: FC<IssueCardProps> = ({ bug }) => {
  // Format date as YYYY-MM-DD for SSR/client consistency
  const createdDate = bug.created_at.slice(0, 10)

  return (
    <div className="card mb-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm uppercase text-[var(--subtext)]">
            {bug.issue_type}
          </div>
          <h3 className="text-lg font-semibold">{bug.title}</h3>
        </div>
        <div className="text-sm font-bold">
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
            className="px-2 py-0.5 bg-[var(--accent)] bg-opacity-20 text-[var(--accent)] rounded"
          >
            {lbl}
          </span>
        ))}
      </div>

      {bug.assignee && (
        <div className="mt-3 w-6 h-6 rounded-full bg-[var(--border)] flex items-center justify-center text-xs">
          {bug.assignee.charAt(0).toUpperCase()}
        </div>
      )}

      <SubtasksList parentId={bug.id} />
    </div>
  )
}
