// src/components/bugs/IssueDetail.tsx
'use client'

import { FC, useState, useEffect } from 'react'
import { Tabs } from '@/components/ui/Tabs'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import type { definitions as DB } from '@/types/database'
import { CommentList } from '@/components/bugs/CommentList'
import { CommentForm } from '@/components/bugs/CommentForm'
import { Timeline } from '@/components/bugs/Timeline'
import { AttachmentsList } from '@/components/bugs/AttachmentsList'
import { AttachmentUpload } from '@/components/bugs/AttachmentUpload'

type Bug = DB['bugs']

interface IssueDetailProps {
  bug: Bug
}

export const IssueDetail: FC<IssueDetailProps> = ({ bug }) => {
  const tabs = [
    { key: 'details', label: 'Details' },
    { key: 'comments', label: 'Comments' },
    { key: 'activity', label: 'Activity' },
    { key: 'attachments', label: 'Attachments' },
  ]

  const [status, setStatus] = useState(bug.status)
  const [priority, setPriority] = useState(bug.priority ?? 'Medium')
  const [epic, setEpic] = useState(bug.epic_id ?? '')
  const [parent, setParent] = useState(bug.parent_id ?? '')
  const [sprint, setSprint] = useState(bug.sprint_id ?? '')
  const [labels, setLabels] = useState<string[]>(bug.labels || [])
  const [dueDate, setDueDate] = useState(bug.due_date ?? '')

  // TODO: load epics, parent issues, and sprints lists via Supabase

  return (
    <div className="flex flex-col h-full">
      <Breadcrumbs />

      <div className="flex-1 p-4 overflow-auto">
        <Tabs tabs={tabs}>
          {/* Details tab */}
          <div className="flex gap-6">
            <section className="w-1/3 bg-[var(--card)] border border-[var(--border)] p-4 rounded">
              <h2 className="text-xl font-semibold text-[var(--text)]">{bug.title}</h2>
              <p className="text-sm text-[var(--subtext)]">#{bug.id}</p>
              <p className="text-sm text-[var(--subtext)] mt-2">
                Created: {new Date(bug.created_at).toLocaleDateString()}
              </p>
            </section>

            <section className="flex-1 bg-[var(--card)] border border-[var(--border)] p-6 rounded space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Status */}
                <div>
                  <label className="block mb-1 text-[var(--text)]">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring focus:ring-[var(--accent-hover)]"
                  >
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Closed</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block mb-1 text-[var(--text)]">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring focus:ring-[var(--accent-hover)]"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>

                {/* Issue Type */}
                <div>
                  <label className="block mb-1 text-[var(--text)]">Issue Type</label>
                  <select
                    value={bug.issue_type}
                    disabled
                    className="w-full px-3 py-2 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--text)]"
                  >
                    <option>Bug</option>
                    <option>Task</option>
                    <option>Story</option>
                  </select>
                </div>

                {/* Epic */}
                <div>
                  <label className="block mb-1 text-[var(--text)]">Epic</label>
                  <select
                    value={epic}
                    onChange={(e) => setEpic(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring focus:ring-[var(--accent-hover)]"
                  >
                    <option value="">None</option>
                    {/* TODO: map your epics here */}
                  </select>
                </div>

                {/* Parent Issue */}
                <div>
                  <label className="block mb-1 text-[var(--text)]">Parent Issue</label>
                  <select
                    value={parent}
                    onChange={(e) => setParent(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring focus:ring-[var(--accent-hover)]"
                  >
                    <option value="">None</option>
                    {/* TODO: map parent issues here */}
                  </select>
                </div>

                {/* Sprint */}
                <div>
                  <label className="block mb-1 text-[var(--text)]">Sprint</label>
                  <select
                    value={sprint}
                    onChange={(e) => setSprint(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring focus:ring-[var(--accent-hover)]"
                  >
                    <option value="">None</option>
                    {/* TODO: map sprints here */}
                  </select>
                </div>
              </div>

              {/* Labels & Due Date */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block mb-1 text-[var(--text)]">Labels</label>
                  <input
                    type="text"
                    value={labels.join(', ')}
                    onChange={(e) => setLabels(e.target.value.split(',').map((l) => l.trim()))}
                    placeholder="Add label"
                    className="w-full px-3 py-2 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring focus:ring-[var(--accent-hover)]"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[var(--text)]">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="px-3 py-2 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring focus:ring-[var(--accent-hover)]"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Comments tab */}
          <div>
            <CommentList bugId={bug.id} />
            <CommentForm bugId={bug.id} />
          </div>

          {/* Activity tab */}
          <div>
            <Timeline bugId={bug.id} />
          </div>

          {/* Attachments tab */}
          <div>
            <AttachmentsList bugId={bug.id} />
            <AttachmentUpload bugId={bug.id} />
          </div>
        </Tabs>
      </div>
    </div>
  )
}
