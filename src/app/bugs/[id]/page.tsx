'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { Bug } from '@/types'

type Profile = { id: string; full_name?: string | null; email?: string | null }
type Sprint = { id: string; name: string }
type Epic = { id: string; name: string; key: string }
type Project = { id: string; name: string; key: string }
type Comment = { id: string; bug_id: string; author_id: string; content: string; created_at: string; updated_at: string }
type Attachment = { id: string; bug_id: string; filename: string; file_path: string; file_size: number; mime_type: string; uploaded_by: string; created_at: string }
type Activity = { id: string; bug_id: string; user_id: string; action: string; field_name?: string; old_value?: string; new_value?: string; created_at: string }

const ATTACHMENT_BUCKET = 'bug-attachments'

// Mobile breakpoint
const MOBILE_BREAKPOINT = 768

// Icons
const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
  </svg>
)

const PaperclipIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
)

const MessageSquareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const ActivityIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
)

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
)

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </svg>
)

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" />
  </svg>
)

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
)

const FileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" />
  </svg>
)

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
  </svg>
)

// Helper function to check if file is an image
function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

// Helper function to render text with clickable links
function renderTextWithLinks(text: string): React.ReactNode {
  const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g
  const parts = text.split(urlRegex)

  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      urlRegex.lastIndex = 0
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'var(--accent-primary)',
            textDecoration: 'underline',
            wordBreak: 'break-all',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      )
    }
    return part
  })
}

export default function BugDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bugId = params?.id as string

  const [bug, setBug] = useState<Bug | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [epics, setEpics] = useState<Epic[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [newComment, setNewComment] = useState('')
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentText, setEditingCommentText] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Editing bug fields
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string>('')

  // Attachment viewer modal
  const [viewingAttachment, setViewingAttachment] = useState<Attachment | null>(null)

  // Mobile tabs
  const [activeTab, setActiveTab] = useState<'details' | 'attachments' | 'comments' | 'activity'>('details')
  const [isMobile, setIsMobile] = useState(false)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Check screen size
  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (bugId) loadAll()
    getCurrentUser()
  }, [bugId])

  async function getCurrentUser() {
    try {
      const { data } = await supabase.auth.getUser()
      setCurrentUserId(data?.user?.id ?? null)
    } catch {
      setCurrentUserId(null)
    }
  }

  async function loadAll() {
    if (!isSupabaseConfigured) {
      setLoading(false)
      setError('Database not configured')
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Try to find bug by ID or bug_key
      let bugData = null
      let bugError = null

      // First try by ID (UUID)
      const { data: byId, error: idError } = await supabase.from('bugs').select('*').eq('id', bugId).single()
      if (!idError && byId) {
        bugData = byId
      } else {
        // Try by bug_key
        const { data: byKey, error: keyError } = await supabase.from('bugs').select('*').eq('bug_key', bugId.toUpperCase()).single()
        if (!keyError && byKey) {
          bugData = byKey
        } else {
          // Try case-insensitive bug_key search
          const { data: byKeyLower, error: keyLowerError } = await supabase.from('bugs').select('*').ilike('bug_key', bugId).single()
          if (!keyLowerError && byKeyLower) {
            bugData = byKeyLower
          } else {
            bugError = idError || keyError || keyLowerError
          }
        }
      }

      if (bugError || !bugData) throw new Error('Bug not found')
      setBug(bugData as Bug)

      // Load profiles
      const { data: profs } = await supabase.from('profiles').select('id, full_name, email').order('full_name', { ascending: true })
      setProfiles(profs || [])

      // Load sprints
      const { data: sprintData } = await supabase.from('sprints').select('id, name').order('name', { ascending: true })
      setSprints(sprintData || [])

      // Load epics
      const { data: epicData } = await supabase.from('epics').select('id, name, key').order('name', { ascending: true })
      setEpics(epicData || [])

      // Load projects
      const { data: projectData } = await supabase.from('projects').select('id, name, key').order('name', { ascending: true })
      setProjects(projectData || [])

      // Load attachments
      const { data: atts } = await supabase.from('bug_attachments').select('*').eq('bug_id', bugData.id).order('created_at', { ascending: true })
      setAttachments((atts as Attachment[]) || [])

      // Load comments
      const { data: cms } = await supabase.from('bug_comments').select('*').eq('bug_id', bugData.id).order('created_at', { ascending: true })
      setComments((cms as Comment[]) || [])

      // Load activities
      const { data: acts } = await supabase.from('bug_activities').select('*').eq('bug_id', bugData.id).order('created_at', { ascending: false }).limit(20)
      setActivities((acts as Activity[]) || [])
    } catch (ex: unknown) {
      const msg = ex instanceof Error ? ex.message : 'Failed to load bug'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // Profile display
  function getProfileName(id?: string | null): string {
    if (!id) return 'Unassigned'
    const p = profiles.find(x => x.id === id)
    return p?.full_name || p?.email || id.slice(0, 8)
  }

  function getProfileInitial(id?: string | null): string {
    const name = getProfileName(id)
    return name[0]?.toUpperCase() || '?'
  }

  // Sprint/Epic/Project display
  function getSprintName(id?: string | null): string {
    if (!id) return 'None'
    const s = sprints.find(x => x.id === id)
    return s?.name || 'Unknown'
  }

  function getEpicName(id?: string | null): string {
    if (!id) return 'None'
    const e = epics.find(x => x.id === id)
    return e?.name || 'Unknown'
  }

  function getProjectName(id?: string | null): string {
    if (!id) return 'None'
    const p = projects.find(x => x.id === id)
    return p?.name || 'Unknown'
  }

  // Date formatting
  function formatDate(value?: string | null): string {
    if (!value) return 'Not set'
    const d = new Date(value)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function timeAgo(value?: string): string {
    if (!value) return ''
    const d = new Date(value)
    const now = new Date()
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
    return formatDate(value)
  }

  // Status badge
  function getStatusClass(status?: string): string {
    const s = (status || '').toLowerCase()
    if (s.includes('progress')) return 'badge-progress'
    if (s.includes('resolved')) return 'badge-resolved'
    if (s.includes('closed')) return 'badge-closed'
    return 'badge-open'
  }

  function getPriorityClass(priority?: string): string {
    const p = (priority || '').toLowerCase()
    if (p === 'critical') return 'badge-priority-critical'
    if (p === 'high') return 'badge-priority-high'
    if (p === 'medium') return 'badge-priority-medium'
    return 'badge-priority-low'
  }

  function getSeverityClass(severity?: string): string {
    const s = (severity || '').toLowerCase()
    if (s === 'blocker' || s === 'critical') return 'badge-priority-critical'
    if (s === 'major') return 'badge-priority-high'
    return 'badge-priority-low'
  }

  // Update bug field
  async function updateBugField(field: string, value: string | string[] | number | null) {
    if (!bug) return
    try {
      const { error: updateError } = await supabase
        .from('bugs')
        .update({ [field]: value })
        .eq('id', bug.id)

      if (updateError) throw updateError

      // Log activity
      try {
        await supabase.from('bug_activities').insert({
          bug_id: bug.id,
          user_id: currentUserId,
          action: 'updated',
          field_name: field,
          old_value: String((bug as unknown as Record<string, unknown>)[field] || ''),
          new_value: String(value || ''),
        })
      } catch { /* ignore */ }

      toast.success(`Updated ${field.replace(/_/g, ' ')}`)
      setEditingField(null)
      loadAll()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update')
    }
  }

  // Comments
  async function postComment() {
    if (!newComment.trim() || !bug || !currentUserId) return
    setSubmittingComment(true)
    try {
      const { error: insertError } = await supabase.from('bug_comments').insert({
        bug_id: bug.id,
        author_id: currentUserId,
        content: newComment.trim(),
      })
      if (insertError) throw insertError

      try {
        await supabase.from('bug_activities').insert({
          bug_id: bug.id,
          user_id: currentUserId,
          action: 'commented',
        })
      } catch { /* ignore */ }

      setNewComment('')
      toast.success('Comment posted')
      loadAll()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to post comment')
    } finally {
      setSubmittingComment(false)
    }
  }

  async function updateComment(commentId: string) {
    if (!editingCommentText.trim()) return
    try {
      const { error: updateError } = await supabase
        .from('bug_comments')
        .update({ content: editingCommentText.trim() })
        .eq('id', commentId)

      if (updateError) throw updateError

      setEditingCommentId(null)
      setEditingCommentText('')
      toast.success('Comment updated')
      loadAll()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update comment')
    }
  }

  async function deleteComment(commentId: string) {
    if (!confirm('Delete this comment?')) return
    try {
      const { error: deleteError } = await supabase.from('bug_comments').delete().eq('id', commentId)
      if (deleteError) throw deleteError
      toast.success('Comment deleted')
      loadAll()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete comment')
    }
  }

  // Attachments
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0 || !bug || !currentUserId) return
    setUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const path = `${bug.id}/${Date.now()}_${file.name}`
        const { error: uploadError } = await supabase.storage.from(ATTACHMENT_BUCKET).upload(path, file)
        if (uploadError) {
          toast.error(`Failed to upload ${file.name}`)
          continue
        }

        await supabase.from('bug_attachments').insert({
          bug_id: bug.id,
          filename: file.name,
          file_path: path,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: currentUserId,
        })

        try {
          await supabase.from('bug_activities').insert({
            bug_id: bug.id,
            user_id: currentUserId,
            action: 'attached_file',
            new_value: file.name,
          })
        } catch { /* ignore */ }
      }
      toast.success('File(s) uploaded')
      loadAll()
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function deleteAttachment(att: Attachment) {
    if (!confirm(`Delete "${att.filename}"?`)) return
    try {
      await supabase.storage.from(ATTACHMENT_BUCKET).remove([att.file_path])
      const { error: deleteError } = await supabase.from('bug_attachments').delete().eq('id', att.id)
      if (deleteError) throw deleteError
      toast.success('Attachment deleted')
      loadAll()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete')
    }
  }

  function getAttachmentUrl(path: string): string {
    const { data } = supabase.storage.from(ATTACHMENT_BUCKET).getPublicUrl(path)
    return data.publicUrl || ''
  }

  // Render editable field
  function renderEditableField(
    field: string,
    label: string,
    value: string | null | undefined,
    type: 'text' | 'textarea' | 'select' | 'date' | 'number',
    options?: { value: string; label: string }[]
  ) {
    const displayValue = value || 'Not set'
    const isEditing = editingField === field

    if (isEditing) {
      return (
        <div className="editable-field">
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
            {label}
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {type === 'select' && options ? (
              <select
                className="input"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                style={{ flex: 1, minWidth: '150px' }}
              >
                {options.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : type === 'textarea' ? (
              <textarea
                className="input"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                rows={3}
                style={{ flex: 1, minWidth: '200px' }}
              />
            ) : type === 'date' ? (
              <input
                type="date"
                className="input"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                style={{ flex: 1, minWidth: '150px' }}
              />
            ) : type === 'number' ? (
              <input
                type="number"
                className="input"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                style={{ flex: 1, minWidth: '100px' }}
              />
            ) : (
              <input
                type="text"
                className="input"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                style={{ flex: 1, minWidth: '150px' }}
              />
            )}
            <button className="btn btn-sm btn-primary" onClick={() => {
              let finalValue: string | string[] | number | null = editValue
              if (type === 'number') {
                finalValue = editValue ? parseInt(editValue) : null
              } else if (!editValue) {
                finalValue = null
              }
              if (field === 'labels') {
                finalValue = editValue.split(',').map(s => s.trim()).filter(Boolean)
              }
              updateBugField(field, finalValue)
            }}>Save</button>
            <button className="btn btn-sm btn-secondary" onClick={() => setEditingField(null)}>Cancel</button>
          </div>
        </div>
      )
    }

    return (
      <div
        className="editable-field"
        onClick={() => {
          setEditingField(field)
          setEditValue(value || '')
        }}
        style={{ cursor: 'pointer' }}
      >
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
          {label}
        </label>
        <div style={{ color: value ? 'var(--text-primary)' : 'var(--text-muted)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ whiteSpace: 'pre-wrap' }}>{displayValue}</span>
          <EditIcon />
        </div>
      </div>
    )
  }

  // Render
  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ height: '32px', width: '200px', marginBottom: '24px' }} />
        <div className="card">
          <div className="card-body">
            <div className="skeleton" style={{ height: '400px' }} />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <div className="alert alert-error">{error}</div>
        <button className="btn btn-secondary" onClick={() => router.back()} style={{ marginTop: '16px' }}>
          <ArrowLeftIcon /> Back
        </button>
      </div>
    )
  }

  if (!bug) {
    return (
      <div>
        <div className="alert alert-error">Bug not found</div>
        <button className="btn btn-secondary" onClick={() => router.back()} style={{ marginTop: '16px' }}>
          <ArrowLeftIcon /> Back
        </button>
      </div>
    )
  }

  const bugKey = bug.bug_key || `BUG-${String(bug.id).slice(-6)}`

  // Mobile Tab Content
  const renderDetailsTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Title - Editable */}
      <div className="card">
        <div className="card-body">
          {renderEditableField('title', 'Title', bug.title, 'text')}
        </div>
      </div>

      {/* Description - Editable */}
      <div className="card">
        <div className="card-body">
          {renderEditableField('description', 'Description', bug.description || '', 'textarea')}
        </div>
      </div>

      {/* Bug Details Section */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Bug Details</span>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {renderEditableField('steps_to_reproduce', 'Steps to Reproduce', bug.steps_to_reproduce || '', 'textarea')}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
            {renderEditableField('expected_result', 'Expected Result', bug.expected_result || '', 'text')}
            {renderEditableField('actual_result', 'Actual Result', bug.actual_result || '', 'text')}
          </div>
        </div>
      </div>

      {/* Status & Priority */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Status & Priority</span>
        </div>
        <div className="card-body" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
              Status
            </label>
            {editingField === 'status' ? (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <select
                  className="input"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  style={{ flex: 1, minWidth: '120px' }}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                  <option value="Reopened">Reopened</option>
                </select>
                <button className="btn btn-sm btn-primary" onClick={() => updateBugField('status', editValue)}>Save</button>
                <button className="btn btn-sm btn-secondary" onClick={() => setEditingField(null)}>Cancel</button>
              </div>
            ) : (
              <div
                onClick={() => { setEditingField('status'); setEditValue(bug.status || 'Open') }}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <span className={`badge ${getStatusClass(bug.status)}`}>{bug.status || 'Open'}</span>
                <EditIcon />
              </div>
            )}
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
              Priority
            </label>
            {editingField === 'priority' ? (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <select
                  className="input"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  style={{ flex: 1, minWidth: '120px' }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <button className="btn btn-sm btn-primary" onClick={() => updateBugField('priority', editValue)}>Save</button>
                <button className="btn btn-sm btn-secondary" onClick={() => setEditingField(null)}>Cancel</button>
              </div>
            ) : (
              <div
                onClick={() => { setEditingField('priority'); setEditValue(bug.priority || 'medium') }}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <span className={`badge ${getPriorityClass(bug.priority)}`}>{bug.priority || 'Medium'}</span>
                <EditIcon />
              </div>
            )}
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
              Severity
            </label>
            {editingField === 'severity' ? (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <select
                  className="input"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  style={{ flex: 1, minWidth: '120px' }}
                >
                  <option value="minor">Minor</option>
                  <option value="major">Major</option>
                  <option value="critical">Critical</option>
                  <option value="blocker">Blocker</option>
                </select>
                <button className="btn btn-sm btn-primary" onClick={() => updateBugField('severity', editValue)}>Save</button>
                <button className="btn btn-sm btn-secondary" onClick={() => setEditingField(null)}>Cancel</button>
              </div>
            ) : (
              <div
                onClick={() => { setEditingField('severity'); setEditValue(bug.severity || 'major') }}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <span className={`badge ${getSeverityClass(bug.severity)}`}>{bug.severity || 'Major'}</span>
                <EditIcon />
              </div>
            )}
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
              Issue Type
            </label>
            {editingField === 'issue_type' ? (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <select
                  className="input"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  style={{ flex: 1, minWidth: '120px' }}
                >
                  <option value="Bug">Bug</option>
                  <option value="Task">Task</option>
                  <option value="Story">Story</option>
                  <option value="Sub-task">Sub-task</option>
                </select>
                <button className="btn btn-sm btn-primary" onClick={() => updateBugField('issue_type', editValue)}>Save</button>
                <button className="btn btn-sm btn-secondary" onClick={() => setEditingField(null)}>Cancel</button>
              </div>
            ) : (
              <div
                onClick={() => { setEditingField('issue_type'); setEditValue(bug.issue_type || 'Bug') }}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <span style={{ color: 'var(--text-primary)' }}>{bug.issue_type || 'Bug'}</span>
                <EditIcon />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assignment */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Assignment</span>
        </div>
        <div className="card-body" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
              Assignee
            </label>
            {editingField === 'assignee_id' ? (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <select
                  className="input"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  style={{ flex: 1, minWidth: '150px' }}
                >
                  <option value="">Unassigned</option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>{p.full_name || p.email || p.id}</option>
                  ))}
                </select>
                <button className="btn btn-sm btn-primary" onClick={() => updateBugField('assignee_id', editValue || null)}>Save</button>
                <button className="btn btn-sm btn-secondary" onClick={() => setEditingField(null)}>Cancel</button>
              </div>
            ) : (
              <div
                onClick={() => { setEditingField('assignee_id'); setEditValue(bug.assignee_id || '') }}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: bug.assignee_id ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' : 'var(--surface-2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 600,
                    color: 'white',
                  }}
                >
                  {getProfileInitial(bug.assignee_id)}
                </div>
                <span style={{ color: 'var(--text-secondary)' }}>{getProfileName(bug.assignee_id)}</span>
                <EditIcon />
              </div>
            )}
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
              Project
            </label>
            {editingField === 'project_id' ? (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <select
                  className="input"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  style={{ flex: 1, minWidth: '150px' }}
                >
                  <option value="">None</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.key})</option>
                  ))}
                </select>
                <button className="btn btn-sm btn-primary" onClick={() => updateBugField('project_id', editValue || null)}>Save</button>
                <button className="btn btn-sm btn-secondary" onClick={() => setEditingField(null)}>Cancel</button>
              </div>
            ) : (
              <div
                onClick={() => { setEditingField('project_id'); setEditValue(bug.project_id || '') }}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <span style={{ color: bug.project_id ? 'var(--text-primary)' : 'var(--text-muted)' }}>{getProjectName(bug.project_id)}</span>
                <EditIcon />
              </div>
            )}
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
              Sprint
            </label>
            {editingField === 'sprint_id' ? (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <select
                  className="input"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  style={{ flex: 1, minWidth: '150px' }}
                >
                  <option value="">None</option>
                  {sprints.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <button className="btn btn-sm btn-primary" onClick={() => updateBugField('sprint_id', editValue || null)}>Save</button>
                <button className="btn btn-sm btn-secondary" onClick={() => setEditingField(null)}>Cancel</button>
              </div>
            ) : (
              <div
                onClick={() => { setEditingField('sprint_id'); setEditValue(bug.sprint_id || '') }}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <span style={{ color: bug.sprint_id ? 'var(--text-primary)' : 'var(--text-muted)' }}>{getSprintName(bug.sprint_id)}</span>
                <EditIcon />
              </div>
            )}
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
              Epic
            </label>
            {editingField === 'epic_id' ? (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <select
                  className="input"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  style={{ flex: 1, minWidth: '150px' }}
                >
                  <option value="">None</option>
                  {epics.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
                <button className="btn btn-sm btn-primary" onClick={() => updateBugField('epic_id', editValue || null)}>Save</button>
                <button className="btn btn-sm btn-secondary" onClick={() => setEditingField(null)}>Cancel</button>
              </div>
            ) : (
              <div
                onClick={() => { setEditingField('epic_id'); setEditValue(bug.epic_id || '') }}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <span style={{ color: bug.epic_id ? 'var(--text-primary)' : 'var(--text-muted)' }}>{getEpicName(bug.epic_id)}</span>
                <EditIcon />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Fields */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Additional Information</span>
        </div>
        <div className="card-body" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
          {renderEditableField('due_date', 'Due Date', bug.due_date || '', 'date')}
          {renderEditableField('story_points', 'Story Points', bug.story_points?.toString() || '', 'number')}
          {renderEditableField('labels', 'Labels', Array.isArray(bug.labels) ? bug.labels.join(', ') : '', 'text')}
        </div>
      </div>

      {/* Environment */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Environment</span>
        </div>
        <div className="card-body" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
          {renderEditableField('environment', 'Environment', bug.environment || '', 'text')}
          {renderEditableField('device', 'Device', bug.device || '', 'text')}
          {renderEditableField('browser', 'Browser', bug.browser || '', 'text')}
          {renderEditableField('os', 'Operating System', bug.os || '', 'text')}
        </div>
      </div>

      {/* Read-only Info */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Metadata</span>
        </div>
        <div className="card-body" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', fontSize: '13px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
              Reporter
            </label>
            <span style={{ color: 'var(--text-primary)' }}>{getProfileName(bug.reporter_id)}</span>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
              Created
            </label>
            <span style={{ color: 'var(--text-primary)' }}>{formatDate(bug.created_at)}</span>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
              Updated
            </label>
            <span style={{ color: 'var(--text-primary)' }}>{formatDate(bug.updated_at)}</span>
          </div>
          {bug.resolved_at && (
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                Resolved
              </label>
              <span style={{ color: 'var(--text-primary)' }}>{formatDate(bug.resolved_at)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderAttachmentsTab = () => (
    <div className="card">
      <div className="card-header">
        <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PaperclipIcon />
          Attachments ({attachments.length})
        </span>
        <label className="btn btn-sm btn-secondary" style={{ cursor: 'pointer' }}>
          <input
            type="file"
            ref={fileInputRef}
            multiple
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            disabled={uploading}
          />
          {uploading ? 'Uploading...' : 'Add Files'}
        </label>
      </div>
      <div className="card-body" style={{ padding: attachments.length === 0 ? '20px' : '12px' }}>
        {attachments.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>
            No attachments yet
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '100px' : '140px'}, 1fr))`, gap: '12px' }}>
            {attachments.map((att) => (
              <div
                key={att.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'var(--surface-1)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onClick={() => setViewingAttachment(att)}
              >
                <div
                  style={{
                    width: '100%',
                    height: isMobile ? '80px' : '100px',
                    background: 'var(--surface-2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {isImageFile(att.mime_type) ? (
                    <img
                      src={getAttachmentUrl(att.file_path)}
                      alt={att.filename}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <FileIcon />
                      <span style={{ fontSize: '10px', textTransform: 'uppercase' }}>{att.filename.split('.').pop()}</span>
                    </div>
                  )}
                </div>
                <div style={{ padding: '8px 10px' }}>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: '4px',
                    }}
                    title={att.filename}
                  >
                    {att.filename}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{Math.round(att.file_size / 1024)} KB</div>
                </div>
                <div style={{ display: 'flex', borderTop: '1px solid var(--border-subtle)', padding: '6px' }}>
                  <a
                    href={getAttachmentUrl(att.file_path)}
                    download={att.filename}
                    className="btn btn-sm btn-ghost"
                    title="Download"
                    style={{ flex: 1, padding: '4px', justifyContent: 'center' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DownloadIcon />
                  </a>
                  {att.uploaded_by === currentUserId && (
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={(e) => { e.stopPropagation(); deleteAttachment(att) }}
                      title="Delete"
                      style={{ flex: 1, padding: '4px', justifyContent: 'center', color: '#ef4444' }}
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderCommentsTab = () => (
    <div className="card">
      <div className="card-header">
        <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquareIcon />
          Comments ({comments.length})
        </span>
      </div>
      <div className="card-body">
        {/* New Comment */}
        <div style={{ marginBottom: '20px' }}>
          <textarea
            className="input"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            disabled={submittingComment}
          />
          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={postComment}
              disabled={!newComment.trim() || submittingComment}
            >
              {submittingComment ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>

        {comments.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {comments.map((comment) => (
              <div key={comment.id} style={{ display: 'flex', gap: '12px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'white',
                    flexShrink: 0,
                  }}
                >
                  {getProfileInitial(comment.author_id)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>{getProfileName(comment.author_id)}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{timeAgo(comment.created_at)}</span>
                  </div>
                  {editingCommentId === comment.id ? (
                    <div>
                      <textarea
                        className="input"
                        value={editingCommentText}
                        onChange={(e) => setEditingCommentText(e.target.value)}
                        rows={2}
                      />
                      <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => updateComment(comment.id)}>Save</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditingCommentId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', marginBottom: '6px', wordBreak: 'break-word' }}>
                        {renderTextWithLinks(comment.content)}
                      </p>
                      {comment.author_id === currentUserId && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => { setEditingCommentId(comment.id); setEditingCommentText(comment.content) }}
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                          >
                            <EditIcon /> Edit
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => deleteComment(comment.id)}
                            style={{ padding: '4px 8px', fontSize: '12px', color: '#ef4444' }}
                          >
                            <TrashIcon /> Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderActivityTab = () => (
    <div className="card">
      <div className="card-header">
        <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ActivityIcon />
          Activity
        </span>
      </div>
      <div className="card-body">
        {activities.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0', fontSize: '13px' }}>
            No activity yet
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activities.map((act) => (
              <div key={act.id} style={{ fontSize: '12px' }}>
                <div style={{ color: 'var(--text-muted)' }}>{timeAgo(act.created_at)}</div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                  <span style={{ fontWeight: 500 }}>{getProfileName(act.user_id)}</span>
                  {' '}{act.action}
                  {act.field_name && (
                    <span style={{ color: 'var(--text-muted)' }}>
                      {' '}{act.field_name}: {act.old_value || '(empty)'} → {act.new_value || '(empty)'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => router.push('/bugs')}
          style={{ marginBottom: '12px' }}
        >
          <ArrowLeftIcon />
          <span>Back to Bugs</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{
            padding: '4px 10px',
            background: 'var(--accent-primary)',
            color: 'white',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: 'monospace',
          }}>
            {bugKey}
          </span>
          <h1 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: 700, margin: 0, flex: 1, minWidth: '200px' }}>
            {bug.title}
          </h1>
        </div>
      </div>

      {/* Mobile Tabs */}
      {isMobile ? (
        <div>
          <div className="tabs" style={{ marginBottom: '16px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <button
              className={`tab ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
              style={{ whiteSpace: 'nowrap' }}
            >
              <InfoIcon /> Details
            </button>
            <button
              className={`tab ${activeTab === 'attachments' ? 'active' : ''}`}
              onClick={() => setActiveTab('attachments')}
              style={{ whiteSpace: 'nowrap' }}
            >
              <PaperclipIcon /> Files ({attachments.length})
            </button>
            <button
              className={`tab ${activeTab === 'comments' ? 'active' : ''}`}
              onClick={() => setActiveTab('comments')}
              style={{ whiteSpace: 'nowrap' }}
            >
              <MessageSquareIcon /> Comments ({comments.length})
            </button>
            <button
              className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={() => setActiveTab('activity')}
              style={{ whiteSpace: 'nowrap' }}
            >
              <ActivityIcon /> Activity
            </button>
          </div>
          <div>
            {activeTab === 'details' && renderDetailsTab()}
            {activeTab === 'attachments' && renderAttachmentsTab()}
            {activeTab === 'comments' && renderCommentsTab()}
            {activeTab === 'activity' && renderActivityTab()}
          </div>
        </div>
      ) : (
        /* Desktop Layout */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px' }}>
          {/* Left Panel - Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {renderDetailsTab()}
            {renderAttachmentsTab()}
            {renderCommentsTab()}
          </div>

          {/* Right Panel - Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Quick Status */}
            <div className="card">
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className={`badge ${getStatusClass(bug.status)}`}>{bug.status || 'Open'}</span>
                  <span className={`badge ${getPriorityClass(bug.priority)}`}>{bug.priority || 'Medium'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: bug.assignee_id ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' : 'var(--surface-2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 600,
                      color: 'white',
                    }}
                  >
                    {getProfileInitial(bug.assignee_id)}
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{getProfileName(bug.assignee_id)}</span>
                </div>
              </div>
            </div>

            {/* Meta Info */}
            <div className="card">
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Reporter</span>
                  <span style={{ color: 'var(--text-primary)' }}>{getProfileName(bug.reporter_id)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Created</span>
                  <span style={{ color: 'var(--text-primary)' }}>{formatDate(bug.created_at)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Updated</span>
                  <span style={{ color: 'var(--text-primary)' }}>{formatDate(bug.updated_at)}</span>
                </div>
                {bug.due_date && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Due Date</span>
                    <span style={{ color: 'var(--text-primary)' }}>{formatDate(bug.due_date)}</span>
                  </div>
                )}
                {bug.severity && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Severity</span>
                    <span className={`badge ${getSeverityClass(bug.severity)}`}>{bug.severity}</span>
                  </div>
                )}
                {bug.story_points && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Story Points</span>
                    <span style={{ color: 'var(--text-primary)' }}>{bug.story_points}</span>
                  </div>
                )}
                {bug.project_id && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Project</span>
                    <span style={{ color: 'var(--text-primary)' }}>{getProjectName(bug.project_id)}</span>
                  </div>
                )}
                {bug.sprint_id && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Sprint</span>
                    <span style={{ color: 'var(--text-primary)' }}>{getSprintName(bug.sprint_id)}</span>
                  </div>
                )}
                {bug.labels && bug.labels.length > 0 && (
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Labels</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {bug.labels.map((label, i) => (
                        <span key={i} style={{
                          padding: '2px 8px',
                          background: 'var(--surface-2)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '11px',
                          color: 'var(--text-secondary)',
                        }}>{label}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Activity */}
            {renderActivityTab()}
          </div>
        </div>
      )}

      {/* Attachment Viewer Modal */}
      {viewingAttachment && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setViewingAttachment(null)}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ color: 'white' }}>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>{viewingAttachment.filename}</div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>{Math.round(viewingAttachment.file_size / 1024)} KB • {timeAgo(viewingAttachment.created_at)}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <a
                href={getAttachmentUrl(viewingAttachment.file_path)}
                download={viewingAttachment.filename}
                className="btn btn-sm"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <DownloadIcon /> Download
              </a>
              <button
                onClick={() => setViewingAttachment(null)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                }}
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          <div
            style={{
              maxWidth: '90vw',
              maxHeight: '80vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {isImageFile(viewingAttachment.mime_type) ? (
              <img
                src={getAttachmentUrl(viewingAttachment.file_path)}
                alt={viewingAttachment.filename}
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
              />
            ) : viewingAttachment.mime_type === 'application/pdf' ? (
              <iframe
                src={getAttachmentUrl(viewingAttachment.file_path)}
                style={{
                  width: '80vw',
                  height: '80vh',
                  border: 'none',
                  borderRadius: '8px',
                  background: 'white',
                }}
                title={viewingAttachment.filename}
              />
            ) : viewingAttachment.mime_type.startsWith('video/') ? (
              <video
                src={getAttachmentUrl(viewingAttachment.file_path)}
                controls
                style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px' }}
              />
            ) : (
              <div
                style={{
                  background: 'var(--surface-1)',
                  padding: '40px 60px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  color: 'var(--text-primary)',
                }}
              >
                <FileIcon />
                <div style={{ marginTop: '16px', fontSize: '18px', fontWeight: 600 }}>{viewingAttachment.filename}</div>
                <div style={{ marginTop: '8px', color: 'var(--text-muted)' }}>This file type cannot be previewed</div>
                <a
                  href={getAttachmentUrl(viewingAttachment.file_path)}
                  download={viewingAttachment.filename}
                  className="btn btn-primary"
                  style={{ marginTop: '20px' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <DownloadIcon /> Download File
                </a>
              </div>
            )}
          </div>

          <div style={{ position: 'absolute', bottom: '24px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
            Click anywhere outside to close
          </div>
        </div>
      )}
    </div>
  )
}
