'use client'
import { FC } from 'react'
import type { Bug } from '@/types'
import { AssignBug } from './AssignBug'
import { CommentList } from './CommentList'
import { CommentForm } from './CommentForm'
import { Timeline } from './Timeline'

interface BugDetailModalProps {
  bug: Bug
  onClose: () => void
}

export const BugDetailModal: FC<BugDetailModalProps> = ({ bug, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-[var(--card)] dark:bg-gray-800 p-6 rounded-2xl w-full max-w-2xl overflow-auto">
      <button onClick={onClose} className="float-right">
        Close
      </button>
      <h2 className="text-2xl font-bold mb-2">{bug.title}</h2>
      <p className="mb-4">{bug.description}</p>
      <AssignBug bugId={bug.id} currentAssignee={bug.assignee} />
      <CommentList bugId={bug.id} />
      <CommentForm bugId={bug.id} />
      <Timeline bugId={bug.id} />
    </div>
  </div>
)
