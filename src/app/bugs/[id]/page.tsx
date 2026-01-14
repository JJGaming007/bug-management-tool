'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { Bug } from '@/types'

type Profile = { id: string; full_name?: string | null; email?: string | null }
type Comment = { id: string; bug_id: string; author_id: string; content: string; created_at: string; updated_at: string }
type Attachment = { id: string; bug_id: string; filename: string; file_path: string; file_size: number; mime_type: string; uploaded_by: string; created_at: string }
type Activity = { id: string; bug_id: string; user_id: string; action: string; field_name?: string; old_value?: string; new_value?: string; created_at: string }

const ATTACHMENT_BUCKET = 'bug-attachments'

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

export default function BugDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bugId = params?.id as string

  const [bug, setBug] = useState<Bug | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
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

  const fileInputRef = useRef<HTMLInputElement | null>(null)

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
      // Load bug
      const { data: b, error: be } = await supabase.from('bugs').select('*').eq('id', bugId).single()
      if (be) throw be
      setBug(b as Bug)

      // Load profiles
      const { data: profs } = await supabase.from('profiles').select('id, full_name, email').order('full_name', { ascending: true })
      setProfiles(profs || [])

      // Load attachments
      const { data: atts } = await supabase.from('bug_attachments').select('*').eq('bug_id', bugId).order('created_at', { ascending: true })
      setAttachments((atts as Attachment[]) || [])

      // Load comments
      const { data: cms } = await supabase.from('bug_comments').select('*').eq('bug_id', bugId).order('created_at', { ascending: true })
      setComments((cms as Comment[]) || [])

      // Load activities
      const { data: acts } = await supabase.from('bug_activities').select('*').eq('bug_id', bugId).order('created_at', { ascending: false }).limit(20)
      setActivities((acts as Activity[]) || [])
    } catch (ex: unknown) {
      const msg = ex instanceof Error ? ex.message : 'Failed to load bug'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // Generate JIRA-style bug key
  function getBugKey(bug: Bug): string {
    if (bug.bug_key) return String(bug.bug_key)
    // Fallback: use last 4 digits of UUID
    const idStr = String(bug.id)
    const shortId = idStr.replace(/-/g, '').slice(-4).toUpperCase()
    return `BUG-${shortId}`
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

  // Date formatting
  function formatDate(value?: string): string {
    if (!value) return ''
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

  // Update bug field
  async function updateBugField(field: string, value: string | null) {
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

      toast.success(`Updated ${field}`)
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

  const bugKey = getBugKey(bug)

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => router.back()}
          style={{ marginBottom: '12px' }}
        >
          <ArrowLeftIcon />
          <span>Back to Bugs</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
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
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0, flex: 1 }}>
            {bug.title}
          </h1>
        </div>
      </div>

      {/* Main Layout - JIRA Style */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
        {/* Left Panel - Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Description */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Description</span>
            </div>
            <div className="card-body">
              <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {bug.description || 'No description provided.'}
              </p>
            </div>
          </div>

          {/* Details Section */}
          {(bug.steps_to_reproduce || bug.expected_result || bug.actual_result) && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">Bug Details</span>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {bug.steps_to_reproduce && (
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Steps to Reproduce
                    </label>
                    <p style={{ marginTop: '6px', whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>
                      {bug.steps_to_reproduce}
                    </p>
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {bug.expected_result && (
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Expected Result
                      </label>
                      <p style={{ marginTop: '6px', color: 'var(--text-secondary)' }}>
                        {bug.expected_result}
                      </p>
                    </div>
                  )}
                  {bug.actual_result && (
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Actual Result
                      </label>
                      <p style={{ marginTop: '6px', color: 'var(--text-secondary)' }}>
                        {bug.actual_result}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Attachments */}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        background: 'var(--surface-1)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                        <PaperclipIcon />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <a
                            href={getAttachmentUrl(att.file_path)}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: 'var(--accent-primary)', fontWeight: 500, textDecoration: 'none' }}
                          >
                            {att.filename}
                          </a>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {Math.round(att.file_size / 1024)} KB • {timeAgo(att.created_at)}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <a
                          href={getAttachmentUrl(att.file_path)}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-ghost"
                          title="Download"
                          style={{ padding: '6px' }}
                        >
                          <DownloadIcon />
                        </a>
                        {att.uploaded_by === currentUserId && (
                          <button
                            className="btn btn-sm btn-ghost"
                            onClick={() => deleteAttachment(att)}
                            title="Delete"
                            style={{ color: '#ef4444', padding: '6px' }}
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

          {/* Comments */}
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

              {/* Comments List */}
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
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 600, fontSize: '13px' }}>
                            {getProfileName(comment.author_id)}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {timeAgo(comment.created_at)}
                          </span>
                        </div>
                        {editingCommentId === comment.id ? (
                          <div>
                            <textarea
                              className="input"
                              value={editingCommentText}
                              onChange={(e) => setEditingCommentText(e.target.value)}
                              rows={2}
                            />
                            <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                              <button className="btn btn-primary btn-sm" onClick={() => updateComment(comment.id)}>
                                Save
                              </button>
                              <button className="btn btn-secondary btn-sm" onClick={() => setEditingCommentId(null)}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', marginBottom: '6px' }}>
                              {comment.content}
                            </p>
                            {comment.author_id === currentUserId && (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  className="btn btn-ghost btn-sm"
                                  onClick={() => {
                                    setEditingCommentId(comment.id)
                                    setEditingCommentText(comment.content)
                                  }}
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
        </div>

        {/* Right Panel - Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Status & Priority */}
          <div className="card">
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                  Status
                </label>
                {editingField === 'status' ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      className="input"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      style={{ flex: 1 }}
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                    <button className="btn btn-sm btn-primary" onClick={() => updateBugField('status', editValue)}>Save</button>
                    <button className="btn btn-sm btn-secondary" onClick={() => setEditingField(null)}>Cancel</button>
                  </div>
                ) : (
                  <div
                    onClick={() => { setEditingField('status'); setEditValue(bug.status || 'Open') }}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className={`badge ${getStatusClass(bug.status)}`}>{bug.status || 'Open'}</span>
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                  Priority
                </label>
                {editingField === 'priority' ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      className="input"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      style={{ flex: 1 }}
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
                    style={{ cursor: 'pointer' }}
                  >
                    <span className={`badge ${getPriorityClass(bug.priority)}`}>
                      {bug.priority || 'Medium'}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                  Assignee
                </label>
                {editingField === 'assignee_id' ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      className="input"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      style={{ flex: 1 }}
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
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {getProfileName(bug.assignee_id)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="card">
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Reporter</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {getProfileName(bug.reporter_id)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Created</span>
                <span style={{ color: 'var(--text-primary)' }}>{formatDate(bug.created_at)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Updated</span>
                <span style={{ color: 'var(--text-primary)' }}>{formatDate(bug.updated_at ?? undefined)}</span>
              </div>
              {bug.environment && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Environment</span>
                  <span style={{ color: 'var(--text-primary)' }}>{bug.environment}</span>
                </div>
              )}
              {bug.device && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Device</span>
                  <span style={{ color: 'var(--text-primary)' }}>{bug.device}</span>
                </div>
              )}
            </div>
          </div>

          {/* Activity */}
          <div className="card">
            <div className="card-header">
              <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <ActivityIcon />
                Activity
              </span>
            </div>
            <div className="card-body" style={{ maxHeight: '300px', overflowY: 'auto' }}>
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
        </div>
      </div>
    </div>
  )
}
