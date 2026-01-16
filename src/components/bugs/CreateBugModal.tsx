'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/context/AuthContext'
import type { Bug } from '@/types'

type Props = {
  isOpen: boolean
  onClose: () => void
  onCreated?: (created?: Bug) => void
}

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)

const ATTACHMENT_BUCKET = 'bug-attachments'

export default function CreateBugModal({ isOpen, onClose, onCreated }: Props) {
  const authContext = useAuth() as { user: { id?: string; email?: string } | null } | null
  const user = authContext?.user ?? null

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [stepsToReproduce, setStepsToReproduce] = useState('')
  const [expectedResult, setExpectedResult] = useState('')
  const [actualResult, setActualResult] = useState('')
  const [environment, setEnvironment] = useState('')
  const [device, setDevice] = useState('')
  const [browser, setBrowser] = useState('')
  const [os, setOs] = useState('')
  const [labelsText, setLabelsText] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')
  const [severity, setSeverity] = useState<'minor' | 'major' | 'critical' | 'blocker'>('major')
  const [issueType, setIssueType] = useState<'Bug' | 'Task' | 'Story' | 'Sub-task'>('Bug')
  const [dueDate, setDueDate] = useState('')
  const [storyPoints, setStoryPoints] = useState('')
  const [assigneeId, setAssigneeId] = useState<string | null>(null)
  const [sprintId, setSprintId] = useState<string | null>(null)
  const [epicId, setEpicId] = useState<string | null>(null)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [files, setFiles] = useState<FileList | null>(null)

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<{
    uploading: boolean
    current: number
    total: number
    currentFileName: string
  }>({ uploading: false, current: 0, total: 0, currentFileName: '' })

  const [profiles, setProfiles] = useState<{ id: string; full_name?: string | null; email?: string | null }[]>([])
  const [sprints, setSprints] = useState<{ id: string; name: string }[]>([])
  const [epics, setEpics] = useState<{ id: string; name: string; key: string }[]>([])
  const [projects, setProjects] = useState<{ id: string; name: string; key: string }[]>([])
  const [isMobile, setIsMobile] = useState(false)

  // Check for mobile screen
  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .order('full_name', { ascending: true })
        setProfiles(profs || [])

        const { data: s } = await supabase.from('sprints').select('id, name').order('name', { ascending: true })
        setSprints(s || [])

        const { data: e } = await supabase.from('epics').select('id, name, key').order('name', { ascending: true })
        setEpics(e || [])

        const { data: p } = await supabase.from('projects').select('id, name, key').order('name', { ascending: true })
        setProjects(p || [])

        // Set default project if available
        if (p && p.length > 0 && !projectId) {
          setProjectId(p[0].id)
        }
      } catch {
        // ignore
      }
    }
    if (isOpen) load()
  }, [isOpen])

  useEffect(() => {
    const prev = document.body.style.overflow
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = prev
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      setTitle('')
      setDescription('')
      setStepsToReproduce('')
      setExpectedResult('')
      setActualResult('')
      setEnvironment('')
      setDevice('')
      setBrowser('')
      setOs('')
      setLabelsText('')
      setPriority('medium')
      setSeverity('major')
      setIssueType('Bug')
      setDueDate('')
      setStoryPoints('')
      setAssigneeId(null)
      setSprintId(null)
      setEpicId(null)
      setProjectId(null)
      setFiles(null)
      setError(null)
      setUploadProgress({ uploading: false, current: 0, total: 0, currentFileName: '' })
    }
  }, [isOpen])

  const labels = useMemo(
    () =>
      labelsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    [labelsText]
  )

  async function safeInsertBug(payload: Record<string, unknown>) {
    const optionalFields = [
      'labels',
      'due_date',
      'reporter_email',
      'sprint_id',
      'epic_id',
      'project_id',
      'assignee_id',
      'severity',
      'issue_type',
      'environment',
      'device',
      'browser',
      'os',
      'steps_to_reproduce',
      'expected_result',
      'actual_result',
      'story_points',
    ]
    const { data, error: supError } = await supabase.from('bugs').insert([payload]).select().single()
    if (!supError) return { data, error: null }
    const msg = (supError.message || '').toLowerCase()
    const toRemove: string[] = []
    for (const f of optionalFields) {
      if (msg.includes(f)) toRemove.push(f)
    }
    if (toRemove.length === 0) return { data: null, error: supError }
    const cleaned = { ...payload }
    for (const f of toRemove) delete cleaned[f]
    const retry = await supabase.from('bugs').insert([cleaned]).select().single()
    if (retry.error) return { data: null, error: retry.error }
    return { data: retry.data, error: null }
  }

  // Ensure user profile exists in the profiles table
  async function ensureProfileExists(userId: string, userEmail?: string): Promise<boolean> {
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single()

      if (existingProfile) {
        return true
      }

      // Profile doesn't exist, create it
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: userEmail || '',
          full_name: userEmail ? userEmail.split('@')[0] : 'User',
        })

      if (insertError) {
        console.error('Failed to create profile:', insertError)
        // If it's a duplicate key error, the profile exists (race condition)
        if (insertError.code === '23505') {
          return true
        }
        return false
      }

      return true
    } catch (err) {
      console.error('Error ensuring profile exists:', err)
      return false
    }
  }

  async function handleCreate(e?: React.FormEvent) {
    e?.preventDefault()
    setError(null)
    if (!title.trim()) {
      setError('Title required')
      return
    }
    if (!description.trim()) {
      setError('Description required')
      return
    }
    if (!user?.id) {
      setError('You must be signed in to create a bug')
      return
    }

    setBusy(true)
    try {
      // Ensure profile exists before creating bug (fixes foreign key constraint)
      const profileExists = await ensureProfileExists(user.id, user.email)
      if (!profileExists) {
        setError('Failed to verify user profile. Please try again.')
        setBusy(false)
        return
      }

      const payload: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim(),
        status: 'Open',
        priority,
        severity,
        issue_type: issueType,
        reporter_id: user.id,
      }
      if (labels.length) payload.labels = labels
      if (dueDate) payload.due_date = dueDate
      if (storyPoints) payload.story_points = parseInt(storyPoints)
      if (assigneeId) payload.assignee_id = assigneeId
      if (sprintId) payload.sprint_id = sprintId
      if (epicId) payload.epic_id = epicId
      if (projectId) payload.project_id = projectId
      if (environment) payload.environment = environment
      if (device) payload.device = device
      if (browser) payload.browser = browser
      if (os) payload.os = os
      if (stepsToReproduce) payload.steps_to_reproduce = stepsToReproduce
      if (expectedResult) payload.expected_result = expectedResult
      if (actualResult) payload.actual_result = actualResult
      if (user.email) payload.reporter_email = user.email

      const { data: bugData, error: insertError } = await safeInsertBug(payload)
      if (insertError) {
        setError(insertError.message || 'Failed to create bug')
        setBusy(false)
        return
      }

      const createdBug = bugData as Bug

      try {
        await supabase.from('bug_activities').insert({
          bug_id: createdBug.id,
          user_id: user.id,
          action: 'created',
        })
      } catch { /* ignore activity log errors */ }

      if (files && files.length > 0) {
        setUploadProgress({ uploading: true, current: 0, total: files.length, currentFileName: files[0].name })
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          setUploadProgress({ uploading: true, current: i + 1, total: files.length, currentFileName: file.name })
          const path = `${createdBug.id}/${Date.now()}_${file.name}`
          const { error: upErr } = await supabase.storage.from(ATTACHMENT_BUCKET).upload(path, file)
          if (upErr) {
            console.error('upload error', upErr)
            continue
          }
          try {
            await supabase.from('bug_attachments').insert({
              bug_id: createdBug.id,
              filename: file.name,
              file_path: path,
              file_size: file.size,
              mime_type: file.type,
              uploaded_by: user.id,
            })
          } catch { /* ignore attachment errors */ }
        }
        setUploadProgress({ uploading: false, current: files.length, total: files.length, currentFileName: '' })
      }

      onCreated?.(createdBug)
      onClose()
    } catch (ex: unknown) {
      const errorMessage = ex instanceof Error ? ex.message : 'Unexpected error'
      setError(errorMessage)
    } finally {
      setBusy(false)
    }
  }

  if (!isOpen) return null
  if (typeof window === 'undefined' || typeof document === 'undefined') return null

  const gridCols = isMobile ? '1fr' : '1fr 1fr'

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{
          maxWidth: isMobile ? '100%' : '800px',
          margin: isMobile ? '0' : '20px',
          maxHeight: isMobile ? '100vh' : '90vh',
          borderRadius: isMobile ? '0' : 'var(--radius-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">Create New Bug</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body" style={{ padding: isMobile ? '16px' : '24px' }}>
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleCreate}>
            {/* Project Selection - Important for bug key */}
            <div className="input-group">
              <label className="input-label">Project *</label>
              <select
                className="input"
                value={projectId ?? ''}
                onChange={(e) => setProjectId(e.target.value || null)}
              >
                <option value="">Select a project</option>
                {projects.map((p) => (
                  <option value={p.id} key={p.id}>
                    {p.name} ({p.key})
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Bug ID will be generated as: {projects.find(p => p.id === projectId)?.key || 'PROJECT'}-X
              </span>
            </div>

            <div className="input-group">
              <label className="input-label">Title *</label>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={busy}
                placeholder="Brief summary of the issue"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Description *</label>
              <textarea
                className="input"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={busy}
                placeholder="Detailed description of the bug"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '16px' }}>
              <div className="input-group">
                <label className="input-label">Issue Type</label>
                <select
                  className="input"
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value as 'Bug' | 'Task' | 'Story' | 'Sub-task')}
                >
                  <option value="Bug">Bug</option>
                  <option value="Task">Task</option>
                  <option value="Story">Story</option>
                  <option value="Sub-task">Sub-task</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Priority</label>
                <select
                  className="input"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high' | 'critical')}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '16px' }}>
              <div className="input-group">
                <label className="input-label">Severity</label>
                <select
                  className="input"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as 'minor' | 'major' | 'critical' | 'blocker')}
                >
                  <option value="minor">Minor</option>
                  <option value="major">Major</option>
                  <option value="critical">Critical</option>
                  <option value="blocker">Blocker</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Assignee</label>
                <select
                  className="input"
                  value={assigneeId ?? ''}
                  onChange={(e) => setAssigneeId(e.target.value || null)}
                >
                  <option value="">Unassigned</option>
                  {profiles.map((p) => (
                    <option value={p.id} key={p.id}>
                      {p.full_name ?? p.email ?? p.id}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '16px' }}>
              <div className="input-group">
                <label className="input-label">Sprint</label>
                <select
                  className="input"
                  value={sprintId ?? ''}
                  onChange={(e) => setSprintId(e.target.value || null)}
                >
                  <option value="">None</option>
                  {sprints.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Epic</label>
                <select
                  className="input"
                  value={epicId ?? ''}
                  onChange={(e) => setEpicId(e.target.value || null)}
                >
                  <option value="">None</option>
                  {epics.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '16px' }}>
              <div className="input-group">
                <label className="input-label">Due Date</label>
                <input
                  type="date"
                  className="input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Story Points</label>
                <input
                  type="number"
                  className="input"
                  value={storyPoints}
                  onChange={(e) => setStoryPoints(e.target.value)}
                  placeholder="e.g., 3"
                  min="0"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Steps to Reproduce</label>
              <textarea
                className="input"
                rows={2}
                value={stepsToReproduce}
                onChange={(e) => setStepsToReproduce(e.target.value)}
                placeholder="1. Go to...&#10;2. Click on...&#10;3. See error"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '16px' }}>
              <div className="input-group">
                <label className="input-label">Expected Result</label>
                <input
                  className="input"
                  value={expectedResult}
                  onChange={(e) => setExpectedResult(e.target.value)}
                  placeholder="What should happen"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Actual Result</label>
                <input
                  className="input"
                  value={actualResult}
                  onChange={(e) => setActualResult(e.target.value)}
                  placeholder="What actually happens"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '16px' }}>
              <div className="input-group">
                <label className="input-label">Environment</label>
                <input
                  className="input"
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                  placeholder="e.g., Production, Staging"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Device</label>
                <input
                  className="input"
                  value={device}
                  onChange={(e) => setDevice(e.target.value)}
                  placeholder="e.g., iPhone 14, Desktop"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '16px' }}>
              <div className="input-group">
                <label className="input-label">Browser</label>
                <input
                  className="input"
                  value={browser}
                  onChange={(e) => setBrowser(e.target.value)}
                  placeholder="e.g., Chrome 120, Safari 17"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Operating System</label>
                <input
                  className="input"
                  value={os}
                  onChange={(e) => setOs(e.target.value)}
                  placeholder="e.g., Windows 11, macOS Sonoma"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Labels (comma separated)</label>
              <input
                className="input"
                value={labelsText}
                onChange={(e) => setLabelsText(e.target.value)}
                placeholder="ui, api, critical"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Attachments</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setFiles(e.target.files)}
                  disabled={busy}
                  style={{
                    padding: '10px',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-secondary)',
                    flex: 1,
                    minWidth: isMobile ? '100%' : '200px',
                  }}
                />
                {uploadProgress.uploading && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      background: 'var(--surface-3)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{
                        animation: 'spin 1s linear infinite',
                      }}
                    >
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                    </svg>
                    <span>
                      Uploading {uploadProgress.current}/{uploadProgress.total}
                    </span>
                  </div>
                )}
              </div>
              {files && files.length > 0 && !uploadProgress.uploading && (
                <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {files.length} file{files.length > 1 ? 's' : ''} selected
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="modal-footer" style={{ flexWrap: 'wrap', gap: '8px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            onClick={handleCreate}
            disabled={busy}
          >
            {busy
              ? uploadProgress.uploading
                ? `Uploading ${uploadProgress.current}/${uploadProgress.total}...`
                : 'Creating...'
              : 'Create Bug'}
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
