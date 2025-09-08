'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { Bug } from '@/types'

type Profile = { id: string; full_name?: string | null; email?: string | null }

const ATTACHMENT_BUCKET = 'bug-attachments'

export default function BugDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bugId = params?.id as string

  const [bug, setBug] = useState<Bug | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [attachments, setAttachments] = useState<any[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [commentEditId, setCommentEditId] = useState<string | null>(null)
  const [commentEditText, setCommentEditText] = useState('')
  const [uploading, setUploading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (bugId) loadAll()
    getCurrentUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setLoading(true)
    setError(null)
    try {
      // bug
      const { data: b, error: be } = await supabase.from('bugs').select('*').eq('id', bugId).single()
      if (be) { setError(prettyError(be.message)); setLoading(false); return }
      setBug(b as Bug)

      // profiles
      const { data: profs } = await supabase.from('profiles').select('id, full_name, email').order('full_name', { ascending: true })
      setProfiles(profs || [])

      // attachments
      const { data: atts } = await supabase.from('bug_attachments').select('*').eq('bug_id', bugId).order('created_at', { ascending: true })
      setAttachments(atts || [])

      // comments
      const { data: cms } = await supabase.from('bug_comments').select('*').eq('bug_id', bugId).order('created_at', { ascending: true })
      setComments(cms || [])
    } catch (ex: any) {
      setError(ex?.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  function prettyError(msg?: string | null) {
    if (!msg) return null
    if (msg.toLowerCase().includes('column')) return 'A database schema mismatch occurred. Please contact an admin.'
    if (msg.toLowerCase().includes('row-level')) return 'new row violates row-level security policy'
    return msg
  }

  /* ------------- Attachments ------------- */

  async function handleFileChoose(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0 || !bug) return
    setUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const path = `${bug.id}/${Date.now()}_${file.name}`
        const up = await supabase.storage.from(ATTACHMENT_BUCKET).upload(path, file)
        if (up.error) {
          setError('Upload failed: ' + up.error.message)
          continue
        }

        // record metadata; uploaded_by will be enforced by RLS to equal auth.uid()
        const { data: authUser } = await supabase.auth.getUser()
        const userId = authUser?.user?.id ?? null
        await supabase.from('bug_attachments').insert({
          bug_id: bug.id,
          filename: file.name,
          file_path: path,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: userId
        })

        // activity log (best-effort)
        await supabase.from('bug_activities').insert({
          bug_id: bug.id,
          actor_id: userId,
          action: 'uploaded_attachment',
          metadata: { filename: file.name }
        }).catch(() => {})
      }

      // refresh attachments
      const { data: atts } = await supabase.from('bug_attachments').select('*').eq('bug_id', bug.id).order('created_at', { ascending: true })
      setAttachments(atts || [])
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (ex: any) {
      setError(ex?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function deleteAttachment(att: any) {
    if (!confirm(`Delete "${att.filename}"?`)) return
    try {
      const { data: authUser } = await supabase.auth.getUser()
      const userId = authUser?.user?.id ?? null

      // delete from storage
      const { error: delErr } = await supabase.storage.from(ATTACHMENT_BUCKET).remove([att.file_path])
      if (delErr) {
        setError('Failed to delete file: ' + delErr.message)
        // still attempt to delete metadata
      }

      // delete metadata row (RLS should allow this if uploaded_by = auth.uid())
      const { error: metaErr } = await supabase.from('bug_attachments').delete().eq('id', att.id)
      if (metaErr) { setError(prettyError(metaErr.message)); return }

      // activity
      await supabase.from('bug_activities').insert({
        bug_id: bugId,
        actor_id: userId,
        action: 'deleted_attachment',
        metadata: { filename: att.filename }
      }).catch(() => {})

      // refresh list
      const { data: atts } = await supabase.from('bug_attachments').select('*').eq('bug_id', bugId).order('created_at', { ascending: true })
      setAttachments(atts || [])
    } catch (ex: any) {
      setError(ex?.message || 'Failed to delete attachment')
    }
  }

  function getAttachmentUrl(path: string) {
    try {
      const { data } = supabase.storage.from(ATTACHMENT_BUCKET).getPublicUrl(path)
      return data.publicURL
    } catch {
      return null
    }
  }

  /* ------------- Comments ------------- */

  async function postComment() {
    if (!newComment.trim() || !bug) return
    try {
      const { data: authUser } = await supabase.auth.getUser()
      const userid = authUser?.user?.id ?? null
      const { error } = await supabase.from('bug_comments').insert({
        bug_id: bug.id,
        author_id: userid,
        comment: newComment.trim()
      })
      if (error) { setError(prettyError(error.message)); return }

      // activity
      await supabase.from('bug_activities').insert({
        bug_id: bug.id,
        actor_id: userid,
        action: 'posted_comment',
        metadata: {}
      }).catch(() => {})

      setNewComment('')
      await loadAll()
    } catch (ex: any) {
      setError(ex?.message || 'Failed to post comment')
    }
  }

  async function startEditComment(c: any) {
    setCommentEditId(c.id)
    setCommentEditText(c.comment)
  }

  async function saveCommentEdit() {
    if (!commentEditId) return
    try {
      const { data: authUser } = await supabase.auth.getUser()
      const userid = authUser?.user?.id ?? null
      const { error } = await supabase.from('bug_comments').update({ comment: commentEditText }).eq('id', commentEditId)
      if (error) { setError(prettyError(error.message)); return }
      await supabase.from('bug_activities').insert({
        bug_id: bugId,
        actor_id: userid,
        action: 'edited_comment',
        metadata: { comment_id: commentEditId }
      }).catch(() => {})
      setCommentEditId(null); setCommentEditText('')
      await loadAll()
    } catch (ex: any) {
      setError(ex?.message || 'Failed to edit comment')
    }
  }

  async function deleteComment(c: any) {
    if (!confirm('Delete this comment?')) return
    try {
      const { data: authUser } = await supabase.auth.getUser()
      const userid = authUser?.user?.id ?? null
      const { error } = await supabase.from('bug_comments').delete().eq('id', c.id)
      if (error) { setError(prettyError(error.message)); return }

      await supabase.from('bug_activities').insert({
        bug_id: bugId,
        actor_id: userid,
        action: 'deleted_comment',
        metadata: { comment_id: c.id }
      }).catch(() => {})

      await loadAll()
    } catch (ex: any) {
      setError(ex?.message || 'Failed to delete comment')
    }
  }

  /* ------------- Render ------------- */

  if (loading) return <div className="content"><div className="card">Loading…</div></div>
  if (error) return <div className="content"><div className="card text-rose-400">{error}</div></div>
  if (!bug) return <div className="content"><div className="card">Bug not found.</div></div>

  return (
    <div className="content max-w-6xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-100 inline-flex items-center gap-3">
          <span>{bug.title || 'Untitled'}</span>
        </h1>
      </div>

      <div className="list-card p-6">
        <div className="bug-detail">
          <section className="bug-panel">
            {/* header info and meta rows */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-300 mb-2">Status</div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${bug.status?.toLowerCase().includes('progress') ? 'status-progress' : bug.status?.toLowerCase().includes('open') ? 'status-new' : ''}`}>{bug.status}</span>
                </div>

                <div className="mt-4 text-sm text-gray-300 mb-2">Priority / Severity</div>
                <div className="flex gap-3 items-center">
                  <span className="chip">{(bug as any).priority ?? '—'}</span>
                  <span className="chip">{(bug as any).severity ?? '—'}</span>
                </div>

                <div className="mt-4 text-sm text-gray-400">{formatDate(bug.created_at)}</div>

                <div className="mt-6 text-sm font-semibold text-gray-200 mb-2">Description</div>
                <div className="rounded-lg bg-white/4 border border-white/6 p-4 text-slate-200 whitespace-pre-wrap">
                  {bug.description}
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-gray-200 mb-2">Details</div>
                <div className="rounded-lg bg-white/4 border border-white/6 p-4 text-sm text-slate-100 space-y-3">
                  <div><span className="text-gray-400">ID:</span> <span className="font-mono">{bug.id}</span></div>
                  <div><span className="text-gray-400">Reporter:</span> {renderProfileLabel(bug, profiles)}</div>
                  <div><span className="text-gray-400">Assignee:</span> {profileDisplay((bug as any).assignee_id, (bug as any).assignee, profiles)}</div>
                  <div><span className="text-gray-400">Environment:</span> {(bug as any).environment ?? '—'}</div>
                  <div><span className="text-gray-400">Device:</span> {(bug as any).device ?? '—'}</div>
                  <div><span className="text-gray-400">Labels:</span> {(bug as any).labels?.join?.(', ') ?? '—'}</div>
                </div>
              </div>
            </div>

            {/* steps / expected / actual */}
            <div className="mt-6">
              <div className="text-sm font-semibold text-gray-200 mb-2">Steps to reproduce</div>
              <div className="rounded-lg bg-white/4 border border-white/6 p-4 text-slate-200 whitespace-pre-wrap">{(bug as any).steps_to_reproduce ?? <span className="text-slate-400">No steps provided.</span>}</div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-semibold text-gray-200 mb-2">Expected result</div>
                <div className="rounded-lg bg-white/4 border border-white/6 p-4 text-slate-200 whitespace-pre-wrap">{(bug as any).expected_result ?? <span className="text-slate-400">—</span>}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-200 mb-2">Actual result</div>
                <div className="rounded-lg bg-white/4 border border-white/6 p-4 text-slate-200 whitespace-pre-wrap">{(bug as any).actual_result ?? <span className="text-slate-400">—</span>}</div>
              </div>
            </div>

            <div className="hr" />

            {/* attachments */}
            <div>
              <div className="text-sm font-semibold text-gray-200 mb-2">Attachments</div>
              <div className="flex items-center gap-3">
                <input ref={fileInputRef} type="file" multiple onChange={handleFileChoose} className="text-slate-300" />
                {uploading && <div className="text-xs text-slate-400">Uploading…</div>}
              </div>

              <div className="mt-3 space-y-2">
                {attachments.length === 0 ? <div className="muted">No attachments</div> : attachments.map(a => (
                  <div key={a.id} className="flex items-center justify-between bg-white/2 p-3 rounded-md">
                    <div>
                      <a href={getAttachmentUrl(a.file_path)} target="_blank" rel="noreferrer" className="text-sky-300 hover:underline">{a.filename}</a>
                      <div className="text-xs text-slate-400">{a.mime_type} • {a.file_size ? `${Math.round(a.file_size/1024)} KB` : ''}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {a.uploaded_by === currentUserId && (
                        <button onClick={() => deleteAttachment(a)} className="btn text-sm">Delete</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hr" />

            {/* comments */}
            <div>
              <div className="text-sm font-semibold text-gray-200 mb-2">Comments</div>
              <textarea className="w-full px-3 py-2 rounded bg-white/5 border border-white/6 text-slate-200" rows={4}
                placeholder="Write a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
              <div className="mt-2 flex items-center gap-3">
                <button onClick={postComment} className="btn primary">Post comment</button>
                <div className="muted">{comments.length} comment{comments.length !== 1 ? 's' : ''}</div>
              </div>

              <div className="mt-4 space-y-4">
                {comments.length === 0 ? <div className="muted">No comments yet.</div> : comments.map(c => (
                  <div key={c.id} className="bg-white/3 p-3 rounded-md">
                    <div className="text-xs text-slate-400">{formatDate(c.created_at)} • {profiles.find(p => p.id === c.author_id)?.full_name ?? profiles.find(p => p.id === c.author_id)?.email ?? c.author_id}</div>

                    {commentEditId === c.id ? (
                      <>
                        <textarea rows={3} className="w-full mt-2 px-2 py-1 bg-white/5 rounded" value={commentEditText} onChange={(e) => setCommentEditText(e.target.value)} />
                        <div className="mt-2 flex gap-2">
                          <button onClick={saveCommentEdit} className="btn">Save</button>
                          <button onClick={() => { setCommentEditId(null); setCommentEditText('') }} className="btn">Cancel</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="mt-2 text-slate-200 whitespace-pre-wrap">{c.comment}</div>
                        <div className="mt-2 flex gap-2">
                          {c.author_id === currentUserId && (
                            <>
                              <button onClick={() => startEditComment(c)} className="btn">Edit</button>
                              <button onClick={() => deleteComment(c)} className="btn">Delete</button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* sidebar */}
          <aside className="bug-sidebar mt-6">
            <div className="meta-field">
              <label>Reporter</label>
              <div className="value readonly">{renderProfileLabel(bug, profiles)}</div>
              <div className="hint">Reporter is read-only</div>
            </div>

            <div className="meta-field">
              <label>Assignee</label>
              <div className="value">{profileDisplay((bug as any).assignee_id, (bug as any).assignee, profiles)}</div>
            </div>

            <div className="hr" />

            <div className="meta-field">
              <label>Activity</label>
              <div className="details">
                <ActivityList bugId={bugId} />
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-6">
          <button onClick={() => router.back()} className="btn">← Back</button>
        </div>
      </div>
    </div>
  )
}

/* small helpers */

function renderProfileLabel(bug: any, profiles: Profile[]) {
  const reporterId = bug?.reporter_id
  const reporterEmail = bug?.reporter_email ?? bug?.reporter
  if (reporterId) {
    const p = profiles.find(x => x.id === reporterId)
    return p ? (p.full_name ?? p.email ?? p.id) : (reporterEmail ?? 'Unknown')
  }
  return reporterEmail ?? 'Unknown'
}

function profileDisplay(assigneeId?: string | null, fallback?: string | null, profiles: Profile[] = []) {
  if (assigneeId) {
    const p = profiles.find((x) => x.id === assigneeId)
    if (p) return p.full_name ?? p.email ?? p.id
    return fallback ?? assigneeId
  }
  return fallback ?? 'Unassigned'
}

function formatDate(value: any) {
  if (!value) return ''
  try {
    const d = new Date(value)
    return d.toLocaleString()
  } catch {
    return String(value)
  }
}

/* Activity list (simple, read-only) */
function ActivityList({ bugId }: { bugId: string }) {
  const [acts, setActs] = useState<any[]>([])
  useEffect(() => {
    let mounted = true
    async function load() {
      const { data } = await supabase.from('bug_activities').select('id, bug_id, actor_id, action, metadata, created_at').eq('bug_id', bugId).order('created_at', { ascending: false }).limit(10)
      if (mounted) setActs(data || [])
    }
    load()
    return () => { mounted = false }
  }, [bugId])
  if (!acts || acts.length === 0) return <div className="muted">No activity yet.</div>
  return (
    <div className="space-y-2">
      {acts.map(a => (
        <div key={a.id} className="text-xs text-slate-400">
          <div>{formatDate(a.created_at)} — <span className="text-slate-200">{a.action}</span></div>
          {a.metadata && <pre className="text-[11px] text-slate-400 mt-1">{JSON.stringify(a.metadata)}</pre>}
        </div>
      ))}
    </div>
  )
}
