// src/components/bugs/IssueDetail.tsx
'use client'

import { FC, useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import type { Bug } from '@/types'
import { IssueCard } from './IssueCard'
import { CommentList } from './CommentList'
import { CommentForm } from './CommentForm'
import { Timeline } from './Timeline'
import { AttachmentsList } from './AttachmentsList'
import { AttachmentUpload } from './AttachmentUpload'
import { Watchers } from './Watchers'
import { EpicSelector } from './EpicSelector'
import { SubtaskSelector } from './SubtaskSelector'
import { SprintSelector } from './SprintSelector'
import { IssueTypeSelector } from './IssueTypeSelector'
import { LabelsInput } from './LabelsInput'
import { DueDatePicker } from './DueDatePicker'

interface IssueDetailProps {
  bug: Bug
}

export const IssueDetail: FC<IssueDetailProps> = ({ bug }) => {
  const [status, setStatus] = useState(bug.status)
  const [priority, setPriority] = useState(bug.priority)
  const [issueType, setIssueType] = useState(bug.issue_type)
  const [epicId, setEpicId] = useState<number | null>(bug.epic_id ?? null)
  const [parentId, setParentId] = useState<number | null>(bug.parent_id ?? null)
  const [sprintId, setSprintId] = useState<number | null>(bug.sprint_id ?? null)
  const [labels, setLabels] = useState<string[]>(bug.labels || [])
  const [dueDate, setDueDate] = useState(bug.due_date?.slice(0, 10) ?? '')

  // Persist updates
  useEffect(() => {
    supabase
      .from('bugs')
      .update({
        status,
        priority,
        issue_type: issueType,
        epic_id: epicId,
        parent_id: parentId,
        sprint_id: sprintId,
        labels,
        due_date: dueDate || null,
      })
      .eq('id', bug.id)
  }, [status, priority, issueType, epicId, parentId, sprintId, labels, dueDate, bug.id])

  return (
    <div className="space-y-6">
      <Link href="/bugs" className="text-sm underline">
        ← Back to Issues
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary card */}
        <div>
          <IssueCard bug={bug} />
        </div>

        {/* Details & actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Editable Fields */}
          <section className="card">
            <h2 className="text-xl font-semibold mb-4">Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <IssueTypeSelector value={issueType} onChange={setIssueType} />
              <EpicSelector value={epicId} onChange={setEpicId} />
              <SubtaskSelector value={parentId} bugs={[bug]} onChange={setParentId} />
              <SprintSelector value={sprintId} onChange={setSprintId} />
              <LabelsInput value={labels} onChange={setLabels} />
              <DueDatePicker value={dueDate} onChange={setDueDate} />
            </div>
          </section>

          {/* Attachments */}
          <section className="card">
            <h2 className="text-xl font-semibold mb-4">Attachments</h2>
            <AttachmentsList bugId={bug.id} />
            <AttachmentUpload bugId={bug.id} onUploaded={() => {}} />
          </section>

          {/* Watchers */}
          <section className="card">
            <h2 className="text-xl font-semibold mb-4">Watchers</h2>
            <Watchers bugId={bug.id} />
          </section>

          {/* Comments */}
          <section className="card">
            <h2 className="text-xl font-semibold mb-4">Comments</h2>
            <CommentList bugId={bug.id} />
            <CommentForm bugId={bug.id} />
          </section>

          {/* Timeline */}
          <section className="card">
            <h2 className="text-xl font-semibold mb-4">Activity</h2>
            <Timeline bugId={bug.id} />
          </section>
        </div>
      </div>
    </div>
  )
}
