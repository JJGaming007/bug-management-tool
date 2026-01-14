// src/components/bugs/NewBugModal.tsx
'use client'

import React, { FC, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Bug } from '@/types'
import { IssueTypeSelector } from '@/components/bugs/IssueTypeSelector'
import { LabelsInput } from '@/components/bugs/LabelsInput'
import { DueDatePicker } from '@/components/bugs/DueDatePicker'
import { SprintSelector } from '@/components/bugs/SprintSelector'
import { EpicSelector } from '@/components/bugs/EpicSelector'
import { SubtaskSelector } from '@/components/bugs/SubtaskSelector'
import { useAuth } from '@/lib/context/AuthContext'

interface NewBugModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}

type RichBugInsert = Omit<Bug, 'id' | 'created_at'>

export const NewBugModal: FC<NewBugModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [labels, setLabels] = useState<string[]>([])
  const [dueDate, setDueDate] = useState<string | null>(null)
  const [score, setScore] = useState<number | null>(null)
  const [issueType, setIssueType] = useState<'Bug' | 'Task' | 'Story'>('Bug')
  const [sprint, setSprint] = useState<string | null>(null)
  const [epic, setEpic] = useState<string | null>(null)
  const [parentId, setParentId] = useState<string | number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { user } = useAuth()

  useEffect(() => {
    if (!isOpen) {
      setTitle('')
      setDescription('')
      setLabels([])
      setDueDate(null)
      setScore(null)
      setIssueType('Bug')
      setSprint(null)
      setEpic(null)
      setParentId(null)
      setError(null)
      setLoading(false)
    }
  }, [isOpen])

  const canSubmit = title.trim().length >= 3 && description.trim().length >= 10

  async function tryInsert(payload: Partial<RichBugInsert>) {
    const { error: e } = await supabase.from('bugs').insert([payload])
    if (e) throw e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError(null)

    const rich: Partial<RichBugInsert> = {
      title: title.trim(),
      description: description.trim(),
      labels,
      due_date: dueDate,
      story_points: score,
      issue_type: issueType,
      sprint_id: sprint,
      epic_id: epic,
      status: 'Open',
    }

    if (user?.email) {
      ;(rich as any).reporter_email = user.email
      ;(rich as any).reporter = user.email
    }

    try {
      await tryInsert(rich)
      setTitle('')
      setDescription('')
      setLabels([])
      setDueDate(null)
      setScore(null)
      setIssueType('Bug')
      setSprint(null)
      setEpic(null)
      setParentId(null)
      onClose()
      onCreated()
    } catch (e1: any) {
      try {
        await tryInsert({ title, description, status: 'new' })
        setTitle('')
        setDescription('')
        onClose()
        onCreated()
      } catch (e2: any) {
        setError(e2?.message || e1?.message || 'Failed to create bug')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="card w-[720px] max-w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="m-0">Create bug</h3>
          <button className="btn ghost" onClick={onClose}>Close</button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 grid gap-3 grid-cols-1 md:grid-cols-2">
          <div className="col-span-2 space-y-2">
            <label>
              <div className="text-xs text-muted">Title</div>
              <input className="input w-full" value={title} onChange={e => setTitle(e.target.value)} />
            </label>

            <label>
              <div className="text-xs text-muted">Description</div>
              <textarea className="input w-full" rows={6} value={description} onChange={e => setDescription(e.target.value)} />
            </label>
          </div>

          <div>
            <label>
              <div className="text-xs text-muted">Issue type</div>
              <IssueTypeSelector value={issueType} onChange={(v) => setIssueType(v)} />
            </label>

            <label className="mt-2 block">
              <div className="text-xs text-muted">Labels</div>
              <LabelsInput value={labels} onChange={setLabels} />
            </label>
          </div>

          <div>
            <label>
              <div className="text-xs text-muted">Due date</div>
              <DueDatePicker value={dueDate} onChange={setDueDate} />
            </label>

            <label className="mt-2 block">
              <div className="text-xs text-muted">Estimate (score)</div>
              <input type="number" className="input w-full" value={score ?? ''} onChange={e => setScore(e.target.value ? Number(e.target.value) : null)} />
            </label>
          </div>

          <div>
            <label>
              <div className="text-xs text-muted">Sprint</div>
              <SprintSelector value={sprint} onChange={setSprint} />
            </label>

            <label className="mt-2 block">
              <div className="text-xs text-muted">Epic</div>
              <EpicSelector value={epic} onChange={setEpic} />
            </label>
          </div>

          <div className="col-span-2">
            <label>
              <div className="text-xs text-muted">Parent Task</div>
              <SubtaskSelector value={parentId} onChange={setParentId} options={[]} bugs={[]} />
            </label>
          </div>

          {error && <div className="col-span-2 text-danger">{error}</div>}

          <div className="col-span-2 flex items-center justify-between">
            <small className="text-muted">
              {canSubmit ? 'Ready to create.' : 'Enter a title (≥3) and description (≥10).'}
            </small>
            <div className="flex gap-2">
              <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
              <button type="submit" disabled={!canSubmit || loading} className="btn">
                {loading ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewBugModal
