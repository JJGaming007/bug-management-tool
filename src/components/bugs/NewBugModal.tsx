// src/components/bugs/NewBugModal.tsx
'use client'

import { FC, useEffect, useState } from 'react'
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

export const NewBugModal: FC<NewBugModalProps> = ({ isOpen, onClose, onCreated }) => {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [issueType, setIssueType] = useState<Bug['issue_type']>('Bug')
  const [priority, setPriority] = useState<Bug['priority']>('medium')
  const [labels, setLabels] = useState<string[]>([])
  const [dueDate, setDueDate] = useState('')
  const [sprintId, setSprintId] = useState<number | null>(null)
  const [epicId, setEpicId] = useState<number | null>(null)
  const [parentId, setParentId] = useState<number | null>(null)
  const [assignee, setAssignee] = useState('')
  const [users, setUsers] = useState<string[]>([])
  const [bugOptions, setBugOptions] = useState<Pick<Bug, 'id' | 'title'>[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    supabase.from('users').select('username').then(({ data }) => {
      if (data) setUsers(data.map(u => u.username))
    })
    supabase.from('bugs').select('id,title').then(({ data }) => {
      if (data) setBugOptions(data as any)
    })
  }, [isOpen])

  const canSubmit = title.trim().length >= 3 && description.trim().length >= 10

  const reset = () => {
    setTitle(''); setDescription(''); setIssueType('Bug'); setPriority('medium'); setLabels([])
    setDueDate(''); setSprintId(null); setEpicId(null); setParentId(null); setAssignee(''); setError(null)
  }

  const tryInsert = async (payload: any) => {
    const { data, error } = await supabase.from('bugs').insert([payload]).select().single()
    if (error) throw error
    return data
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true); setError(null)

    // a "rich" insert that works on most schemas
    const rich: any = {
      title, description,
      issue_type: issueType,
      priority, labels,
      status: 'new',             // compatible with common enums
      assignee: assignee || null,
      due_date: dueDate || null,
      sprint_id: sprintId, epic_id: epicId, parent_id: parentId,
    }
    if (user?.id)   rich.reporter_id = user.id
    if (user?.email){ rich.reporter_email = user.email; rich.reporter = user.email }

    try {
      await tryInsert(rich)
      reset(); onClose(); onCreated()
    } catch (e1: any) {
      try {
        // fallback to minimal insert if schema is strict
        await tryInsert({ title, description, status: 'new' })
        reset(); onClose(); onCreated()
      } catch (e2: any) {
        setError(e2?.message || e1?.message || 'Failed to create bug')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50" style={{ display: 'grid', placeItems: 'center', padding: 16, background: 'rgba(0,0,0,.6)' }}>
      <div className="card" style={{ width: 720, maxWidth: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottom: '1px solid var(--border)' }}>
          <strong>Create Bug</strong>
          <button className="btn secondary" onClick={onClose}>Close</button>
        </div>

        {error && <div style={{ color: '#fecaca', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.4)', margin: 16, padding: 12, borderRadius: 12 }}>{error}</div>}

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 16, padding: 16, gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="block mb-1" style={{ color: 'var(--subtext)' }}>Title</label>
            <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Short, descriptive title" minLength={3} required />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label className="block mb-1" style={{ color: 'var(--subtext)' }}>Description</label>
            <textarea className="input" style={{ height: 140, resize: 'vertical' }} value={description} onChange={e => setDescription(e.target.value)} placeholder="Steps to reproduce, expected/actual…" minLength={10} required />
          </div>

          <IssueTypeSelector value={issueType} onChange={setIssueType} />

          <div>
            <label className="block mb-1" style={{ color: 'var(--subtext)' }}>Priority</label>
            <select className="select" value={priority} onChange={e => setPriority(e.target.value as any)}>
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
            </select>
          </div>

          <LabelsInput value={labels} onChange={setLabels} />
          <DueDatePicker value={dueDate} onChange={setDueDate} />
          <SprintSelector value={sprintId} onChange={setSprintId} />
          <EpicSelector value={epicId} onChange={setEpicId} />
          <SubtaskSelector value={parentId} onChange={setParentId} options={bugOptions} />

          <div>
            <label className="block mb-1" style={{ color: 'var(--subtext)' }}>Assignee</label>
            <select className="select" value={assignee} onChange={e => setAssignee(e.target.value)}>
              <option value="">Unassigned</option>
              {users.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <small style={{ color: 'var(--subtext)' }}>
              {canSubmit ? 'Ready to create.' : 'Enter a title (≥3) and description (≥10).'}
            </small>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
              <button type="submit" disabled={!canSubmit || loading} className="btn">{loading ? 'Creating…' : 'Create'}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
