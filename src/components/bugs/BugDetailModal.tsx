'use client'

import React, { useState, useEffect, useRef } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { Bug } from '@/types'

interface BugDetailModalProps {
  bug: Bug
  onClose: () => void
  onUpdate?: () => void
}

type Profile = { id: string; full_name?: string | null; email?: string | null }
type Comment = { id: string; bug_id: string; author_id: string; content: string; created_at: string }

// Icons
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
)

const PenIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </svg>
)

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
)

const CommentIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const LinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
)

export const BugDetailModal: React.FC<BugDetailModalProps> = ({ bug, onClose, onUpdate }) => {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [localBug, setLocalBug] = useState<Bug>(bug)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadData()
    getCurrentUser()
  }, [bug.id])

  useEffect(() => {
    setLocalBug(bug)
  }, [bug])

  async function getCurrentUser() {
    try {
      const { data } = await supabase.auth.getUser()
      setCurrentUserId(data?.user?.id ?? null)
    } catch {
      setCurrentUserId(null)
    }
  }

  async function loadData() {
    if (!isSupabaseConfigured) return
    try {
      // Load profiles
      const { data: profs } = await supabase.from('profiles').select('id, full_name, email').order('full_name')
      setProfiles(profs || [])

      // Load comments
      const { data: cms } = await supabase.from('bug_comments').select('*').eq('bug_id', bug.id).order('created_at', { ascending: true })
      setComments((cms as Comment[]) || [])
    } catch (e) {
      console.error('Failed to load data:', e)
    }
  }

  function getProfileName(id?: string | null): string {
    if (!id) return 'Unassigned'
    const p = profiles.find(x => x.id === id)
    return p?.full_name || p?.email || id.slice(0, 8)
  }

  function getProfileInitial(id?: string | null): string {
    const name = getProfileName(id)
    return name[0]?.toUpperCase() || '?'
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
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function formatDate(value?: string): string {
    if (!value) return '-'
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

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
    if (s === 'blocker') return 'badge-priority-critical'
    if (s === 'critical') return 'badge-priority-critical'
    if (s === 'major') return 'badge-priority-high'
    return 'badge-priority-low'
  }

  function getBugKey(): string {
    if (localBug.bug_key) return String(localBug.bug_key)
    const idStr = String(localBug.id)
    const shortId = idStr.replace(/-/g, '').slice(-4).toUpperCase()
    return `BUG-${shortId}`
  }

  async function updateField(field: string, value: string | null) {
    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('bugs')
        .update({ [field]: value })
        .eq('id', localBug.id)

      if (error) throw error

      // Log activity
      try {
        await supabase.from('bug_activities').insert({
          bug_id: localBug.id,
          user_id: currentUserId,
          action: 'updated',
          field_name: field,
          old_value: String((localBug as unknown as Record<string, unknown>)[field] || ''),
          new_value: String(value || ''),
        })
      } catch { /* ignore */ }

      toast.success(`Updated ${field.replace('_', ' ')}`)
      setLocalBug({ ...localBug, [field]: value })
      setEditingField(null)
      onUpdate?.()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update')
    } finally {
      setSubmitting(false)
    }
  }

  async function postComment() {
    if (!newComment.trim() || !currentUserId) return
    setSubmitting(true)
    try {
      const { error } = await supabase.from('bug_comments').insert({
        bug_id: localBug.id,
        author_id: currentUserId,
        content: newComment.trim(),
      })
      if (error) throw error
      setNewComment('')
      toast.success('Comment posted')
      loadData()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  function copyBugLink() {
    const url = `${window.location.origin}/bugs/${localBug.id}`
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard')
  }

  // Editable Field Component
  function EditableField({
    label,
    field,
    value,
    type = 'text',
    options,
    displayValue,
    displayClass,
  }: {
    label: string
    field: string
    value: string | null | undefined
    type?: 'text' | 'select' | 'textarea'
    options?: { value: string; label: string }[]
    displayValue?: React.ReactNode
    displayClass?: string
  }) {
    const isEditing = editingField === field

    function startEdit() {
      setEditingField(field)
      setEditValue(value || '')
    }

    function cancelEdit() {
      setEditingField(null)
      setEditValue('')
    }

    function saveEdit() {
      updateField(field, editValue || null)
    }

    return (
      <div className="bug-detail-field">
        <label className="bug-detail-field-label">{label}</label>
        {isEditing ? (
          <div className="bug-detail-field-edit">
            {type === 'select' && options ? (
              <select
                className="input"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                autoFocus
                style={{ flex: 1 }}
              >
                {field === 'assignee_id' && <option value="">Unassigned</option>}
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : type === 'textarea' ? (
              <textarea
                className="input"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                autoFocus
                rows={3}
                style={{ flex: 1 }}
              />
            ) : (
              <input
                type="text"
                className="input"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                autoFocus
                style={{ flex: 1 }}
              />
            )}
            <div className="bug-detail-field-actions">
              <button
                className="bug-detail-action-btn save"
                onClick={saveEdit}
                disabled={submitting}
                title="Save"
              >
                <CheckIcon />
              </button>
              <button
                className="bug-detail-action-btn cancel"
                onClick={cancelEdit}
                disabled={submitting}
                title="Cancel"
              >
                <XIcon />
              </button>
            </div>
          </div>
        ) : (
          <div className="bug-detail-field-value" onClick={startEdit}>
            {displayValue || (
              <span className={displayClass || ''}>
                {value || <span style={{ color: 'var(--text-muted)' }}>None</span>}
              </span>
            )}
            <button className="bug-detail-edit-btn" title="Edit">
              <PenIcon />
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="modal-overlay bug-detail-modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        className="bug-detail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bug-detail-header">
          <div className="bug-detail-header-left">
            <span className="bug-detail-key">{getBugKey()}</span>
            <button className="bug-detail-copy-btn" onClick={copyBugLink} title="Copy link">
              <LinkIcon />
            </button>
          </div>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="bug-detail-content">
          {/* Main Panel */}
          <div className="bug-detail-main">
            {/* Title */}
            <EditableField
              label=""
              field="title"
              value={localBug.title}
              displayValue={
                <h2 className="bug-detail-title">{localBug.title}</h2>
              }
            />

            {/* Description */}
            <div className="bug-detail-section">
              <h3 className="bug-detail-section-title">Description</h3>
              <EditableField
                label=""
                field="description"
                value={localBug.description}
                type="textarea"
                displayValue={
                  <p className="bug-detail-description">
                    {localBug.description || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Add a description...</span>}
                  </p>
                }
              />
            </div>

            {/* Bug Details */}
            {(localBug.steps_to_reproduce || localBug.expected_result || localBug.actual_result) && (
              <div className="bug-detail-section">
                <h3 className="bug-detail-section-title">Bug Details</h3>
                {localBug.steps_to_reproduce && (
                  <EditableField
                    label="Steps to Reproduce"
                    field="steps_to_reproduce"
                    value={localBug.steps_to_reproduce}
                    type="textarea"
                    displayValue={
                      <pre className="bug-detail-preformat">{localBug.steps_to_reproduce}</pre>
                    }
                  />
                )}
                <div className="bug-detail-row">
                  {localBug.expected_result && (
                    <EditableField
                      label="Expected Result"
                      field="expected_result"
                      value={localBug.expected_result}
                      type="textarea"
                    />
                  )}
                  {localBug.actual_result && (
                    <EditableField
                      label="Actual Result"
                      field="actual_result"
                      value={localBug.actual_result}
                      type="textarea"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="bug-detail-section">
              <h3 className="bug-detail-section-title">
                <CommentIcon /> Comments ({comments.length})
              </h3>

              {/* New Comment */}
              <div className="bug-detail-comment-form">
                <textarea
                  className="input"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={2}
                />
                <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={postComment}
                    disabled={!newComment.trim() || submitting}
                  >
                    Post
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className="bug-detail-comments">
                {comments.length === 0 ? (
                  <div className="bug-detail-empty">No comments yet</div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="bug-detail-comment">
                      <div className="bug-detail-comment-avatar">
                        {getProfileInitial(comment.author_id)}
                      </div>
                      <div className="bug-detail-comment-body">
                        <div className="bug-detail-comment-header">
                          <span className="bug-detail-comment-author">
                            {getProfileName(comment.author_id)}
                          </span>
                          <span className="bug-detail-comment-time">
                            {timeAgo(comment.created_at)}
                          </span>
                        </div>
                        <p className="bug-detail-comment-content">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="bug-detail-sidebar">
            {/* Status */}
            <EditableField
              label="Status"
              field="status"
              value={localBug.status}
              type="select"
              options={[
                { value: 'Open', label: 'Open' },
                { value: 'In Progress', label: 'In Progress' },
                { value: 'Resolved', label: 'Resolved' },
                { value: 'Closed', label: 'Closed' },
                { value: 'Reopened', label: 'Reopened' },
              ]}
              displayValue={
                <span className={`badge ${getStatusClass(localBug.status)}`}>
                  {localBug.status || 'Open'}
                </span>
              }
            />

            {/* Priority */}
            <EditableField
              label="Priority"
              field="priority"
              value={localBug.priority}
              type="select"
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'critical', label: 'Critical' },
              ]}
              displayValue={
                <span className={`badge ${getPriorityClass(localBug.priority)}`}>
                  {localBug.priority || 'Medium'}
                </span>
              }
            />

            {/* Severity */}
            <EditableField
              label="Severity"
              field="severity"
              value={localBug.severity}
              type="select"
              options={[
                { value: 'minor', label: 'Minor' },
                { value: 'major', label: 'Major' },
                { value: 'critical', label: 'Critical' },
                { value: 'blocker', label: 'Blocker' },
              ]}
              displayValue={
                <span className={`badge ${getSeverityClass(localBug.severity)}`}>
                  {localBug.severity || 'Major'}
                </span>
              }
            />

            {/* Assignee */}
            <EditableField
              label="Assignee"
              field="assignee_id"
              value={localBug.assignee_id}
              type="select"
              options={profiles.map((p) => ({
                value: p.id,
                label: p.full_name || p.email || p.id,
              }))}
              displayValue={
                <div className="bug-detail-assignee">
                  <div className="bug-detail-avatar">
                    {getProfileInitial(localBug.assignee_id)}
                  </div>
                  <span>{getProfileName(localBug.assignee_id)}</span>
                </div>
              }
            />

            {/* Reporter */}
            <div className="bug-detail-field bug-detail-field-readonly">
              <label className="bug-detail-field-label">Reporter</label>
              <div className="bug-detail-field-value-readonly">
                <div className="bug-detail-assignee">
                  <div className="bug-detail-avatar">
                    {getProfileInitial(localBug.reporter_id)}
                  </div>
                  <span>{getProfileName(localBug.reporter_id)}</span>
                </div>
              </div>
            </div>

            {/* Environment */}
            <EditableField
              label="Environment"
              field="environment"
              value={localBug.environment}
            />

            {/* Browser */}
            <EditableField
              label="Browser"
              field="browser"
              value={localBug.browser}
            />

            {/* OS */}
            <EditableField
              label="OS"
              field="os"
              value={localBug.os}
            />

            {/* Device */}
            <EditableField
              label="Device"
              field="device"
              value={localBug.device}
            />

            {/* Dates */}
            <div className="bug-detail-dates">
              <div className="bug-detail-date">
                <span className="bug-detail-date-label">Created</span>
                <span className="bug-detail-date-value">{formatDate(localBug.created_at)}</span>
              </div>
              <div className="bug-detail-date">
                <span className="bug-detail-date-label">Updated</span>
                <span className="bug-detail-date-value">{formatDate(localBug.updated_at ?? undefined)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BugDetailModal
