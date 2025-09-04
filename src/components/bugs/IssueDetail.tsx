// src/components/bugs/IssueDetail.tsx
'use client'

import { FC } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs } from '@/components/ui/Tabs'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { StatusSelector } from '@/components/bugs/StatusSelector'
import { DeleteBug } from '@/components/bugs/DeleteBug'
import { CommentList } from '@/components/bugs/CommentList'
import { CommentForm } from '@/components/bugs/CommentForm'
import { Timeline } from '@/components/bugs/Timeline'
import { AttachmentsList } from '@/components/bugs/AttachmentsList'
import { AttachmentUpload } from '@/components/bugs/AttachmentUpload'
import type { definitions as DB } from '@/types/database'

type Bug = DB['bugs']

interface IssueDetailProps {
  bug: Bug
}

export const IssueDetail: FC<IssueDetailProps> = ({ bug }) => {
  const router = useRouter()
  const tabs = [
    { key: 'details', label: 'Details' },
    { key: 'comments', label: 'Comments' },
    { key: 'activity', label: 'Activity' },
    { key: 'attachments', label: 'Attachments' },
  ]

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex justify-between items-center">
        <Breadcrumbs
          items={[
            { label: 'Bugs', href: '/bugs' },
            { label: `#${bug.id}`, href: `/bugs/${bug.id}` },
          ]}
        />
        <div className="flex items-center space-x-2">
          <StatusSelector bugId={bug.id} currentStatus={bug.status} />
          <DeleteBug bugId={bug.id} onDeleted={() => router.push('/bugs')} />
        </div>
      </div>

      <div className="flex gap-6">
        <section className="w-1/3 bg-[var(--card)] border border-[var(--border)] p-4 rounded">
          <h2 className="text-xl font-semibold text-[var(--text)]">
            {bug.title}
          </h2>
          <p className="text-sm text-[var(--subtext)]">#{bug.id}</p>
          <p className="text-sm text-[var(--subtext)] mt-2">
            Created: {new Date(bug.created_at).toLocaleDateString()}
          </p>
          <p className="text-sm text-[var(--subtext)] mt-1">
            Priority: {bug.priority}
          </p>
          <p className="text-sm text-[var(--subtext)] mt-1">
            Assignee: {bug.assignee || 'Unassigned'}
          </p>
        </section>

        <section className="flex-1 bg-[var(--card)] border border-[var(--border)] p-6 rounded space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-[var(--text)]">
              Description
            </h3>
            <p className="mt-2 text-[var(--text)]">{bug.description}</p>
          </div>

          <Tabs tabs={tabs}>
            {/* Details – left blank since header & summary cover it */}
            <div />

            {/* Comments */}
            <div className="space-y-4">
              <CommentList bugId={bug.id} />
              <CommentForm
                bugId={bug.id}
                onCommented={() => router.refresh()}
              />
            </div>

            {/* Activity */}
            <div>
              <Timeline bugId={bug.id} />
            </div>

            {/* Attachments */}
            <div className="space-y-4">
              <AttachmentsList bugId={bug.id} />
              <AttachmentUpload
                bugId={bug.id}
                onUploaded={() => router.refresh()}
              />
            </div>
          </Tabs>
        </section>
      </div>
    </div>
  )
}
