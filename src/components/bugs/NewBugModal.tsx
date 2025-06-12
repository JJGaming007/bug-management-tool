'use client'
import { FC, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Bug } from '@/types'
import { IssueTypeSelector } from '@/components/bugs/IssueTypeSelector'
import { LabelsInput } from '@/components/bugs/LabelsInput'
import { DueDatePicker } from '@/components/bugs/DueDatePicker'
import { SprintSelector } from '@/components/bugs/SprintSelector'
import { EpicSelector } from '@/components/bugs/EpicSelector'
import { SubtaskSelector } from '@/components/bugs/SubtaskSelector'

interface NewBugModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (bug: Bug) => void
}

export const NewBugModal: FC<NewBugModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [issueType, setIssueType] = useState<Bug['issue_type']>('Bug')
  const [priority, setPriority] = useState<Bug['priority']>('low')
  const [labels, setLabels] = useState<string[]>([])
  const [dueDate, setDueDate] = useState('')
  const [sprintId, setSprintId] = useState<number | null>(null)
  const [epicId, setEpicId] = useState<number | null>(null)
  const [parentId, setParentId] = useState<number | null>(null)
  const [assignee, setAssignee] = useState('')
  const [users, setUsers] = useState<string[]>([])
  const [bugsList, setBugsList] = useState<Pick<Bug, 'id' | 'title'>[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load users for assignee
    supabase
      .from('users')
      .select('username')
      .then(({ data }) => {
        if (data) setUsers(data.map((u) => u.username))
      })

    // Load existing bugs for parent selection
    supabase
      .from('bugs')
      .select('id,title')
      .then(({ data }) => {
        if (data) setBugsList(data)
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase
      .from('bugs')
      .insert([
        {
          title,
          description,
          issue_type: issueType,
          priority,
          labels,
          due_date: dueDate || null,
          sprint_id: sprintId,
          epic_id: epicId,
          parent_id: parentId,
          status: 'open',
          assignee: assignee || null,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error(error)
    } else {
      onCreated(data!)
    }

    setLoading(false)
    onClose()
    // Reset form
    setTitle('')
    setDescription('')
    setIssueType('Bug')
    setPriority('low')
    setLabels([])
    setDueDate('')
    setSprintId(null)
    setEpicId(null)
    setParentId(null)
    setAssignee('')
  }

  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[var(--card)] p-6 rounded-lg w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Create New Issue</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          {/* Issue Type */}
          <IssueTypeSelector value={issueType} onChange={setIssueType} />

          {/* Epic */}
          <EpicSelector value={epicId} onChange={setEpicId} />

          {/* Parent Issue for Sub-task */}
          <SubtaskSelector value={parentId} bugs={bugsList} onChange={setParentId} />

          {/* Sprint */}
          <SprintSelector value={sprintId} onChange={setSprintId} />

          {/* Labels & Due Date */}
          <LabelsInput value={labels} onChange={setLabels} />
          <DueDatePicker value={dueDate} onChange={setDueDate} />

          {/* Assignee */}
          <div>
            <label className="block mb-1">Assignee</label>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[var(--accent)] text-black rounded-lg hover:bg-[var(--accent-hover)]"
            >
              {loading ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
