// src/app/bugs/[id]/page.tsx
'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import type { Bug } from '@/types'

type Profile = {
  id: string
  full_name?: string | null
  email?: string | null
}

export default function BugDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bugId = params?.id as string

  const [bug, setBug] = useState<Bug | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [profiles, setProfiles] = useState<Profile[]>([])
  const [editableField, setEditableField] = useState<string | null>(null)
  const [fieldValue, setFieldValue] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)

  const titleInputRef = useRef<HTMLInputElement | null>(null)
  const descRef = useRef<HTMLTextAreaElement | null>(null)

  // Which fields are editable (reporter intentionally excluded)
  const EDITABLE = ['title', 'description', 'priority', 'status', 'assignee']

  useEffect(() => {
    if (bugId) fetchBug()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bugId])

  async function fetchBug() {
    try {
      setLoading(true)
      setError(null)
      setBug(null)
      setProfiles([])

      const { data, error: supError } = await supabase
        .from('bugs')
        .select('*')
        .eq('id', bugId)
        .single()

      if (supError) {
        setError(supError.message || 'Failed to fetch bug')
        return
      }

      setBug(data as Bug)

      // load small list of profiles for assignee selection (reporter is not editable)
      const { data: list } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name', { ascending: true })
        .limit(200)

      setProfiles((list as Profile[]) || [])
    } catch (ex: any) {
      setError(ex?.message || 'Failed to fetch bug')
    } finally {
      setLoading(false)
    }
  }

  // start editing a field; pre-populate fieldValue
  function startEdit(field: string) {
    if (!EDITABLE.includes(field)) return // reporter can't be edited
    setFieldError(null)
    setEditableField(field)
    switch (field) {
      case 'title':
        setFieldValue(bug?.title ?? '')
        setTimeout(() => titleInputRef.current?.focus(), 50)
        break
      case 'description':
        setFieldValue(bug?.description ?? '')
        setTimeout(() => descRef.current?.focus(), 50)
        break
      case 'priority':
        setFieldValue((bug as any)?.priority ?? 'Normal')
        break
      case 'status':
        setFieldValue(bug?.status ?? 'Open')
        break
      case 'assignee':
        setFieldValue((bug as any)?.assignee_id ?? '')
        break
      default:
        setFieldValue('')
    }
  }

  // save a single field (maps field names to DB columns)
  async function saveField(field: string) {
    if (!bug) return
    setFieldError(null)

    // simple validation
    if ((field === 'title' || field === 'description') && !String(fieldValue || '').trim()) {
      setFieldError('Cannot be empty')
      return
    }

    // map to payload
    const payload: Record<string, any> = {}
    if (field === 'title') payload.title = String(fieldValue).trim()
    else if (field === 'description') payload.description = String(fieldValue).trim()
    else if (field === 'priority') payload.priority = String(fieldValue)
    else if (field === 'status') payload.status = String(fieldValue)
    else if (field === 'assignee') {
      // if fieldValue matches a profile id, set assignee_id; else set assignee (free text)
      const p = profiles.find((x) => x.id === fieldValue)
      if (p) payload.assignee_id = p.id
      else payload.assignee = fieldValue || null
    } else {
      // unsupported field (shouldn't happen)
      return setEditableField(null)
    }

    try {
      setSaving(true)
      const { data, error: supErr } = await supabase
        .from('bugs')
        .update(payload)
        .eq('id', bug.id)
        .select()
        .single()

      if (supErr) {
        setFieldError(supErr.message || 'Failed to save')
        return
      }

      // success: update local bug and stop editing
      setBug(data as Bug)
      setEditableField(null)
    } catch (ex: any) {
      setFieldError(ex?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  // keyboard handlers
  function onTitleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      saveField('title')
    } else if (e.key === 'Escape') {
      setEditableField(null)
    }
  }
  function onDescKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      saveField('description')
    } else if (e.key === 'Escape') {
      setEditableField(null)
    }
  }

  if (loading) {
    return (
      <div className="content">
        <div className="card">Loading bug...</div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="content">
        <div className="card text-red-500">Error: {error}</div>
      </div>
    )
  }
  if (!bug) {
    return (
      <div className="content">
        <div className="card">Bug not found.</div>
      </div>
    )
  }

  function renderProfileDisplay(profileId?: string | null, fallback?: string | null) {
    if (profileId) {
      const p = profiles.find((x) => x.id === profileId)
      if (p) return p.full_name ?? p.email ?? p.id
      return fallback ?? profileId
    }
    return fallback ?? 'Unknown'
  }

  return (
    <div className="content">
      <h1>
        {editableField === 'title' ? (
          <input
            ref={titleInputRef}
            value={fieldValue ?? ''}
            onChange={(e) => setFieldValue(e.target.value)}
            onBlur={() => saveField('title')}
            onKeyDown={onTitleKey}
            className="w-full bg-white/5 px-3 py-2 rounded"
          />
        ) : (
          <span onClick={() => startEdit('title')} style={{ cursor: 'pointer' }}>
            {bug.title || 'Untitled'}
            <small style={{ marginLeft: 10, color: '#9fb1b6', fontWeight: 400 }}>— Click to edit</small>
          </span>
        )}
      </h1>

      <div className="card col" style={{ gap: 16 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <span
              className="tag"
              style={{ marginRight: 12, cursor: 'pointer' }}
              onClick={() => startEdit('status')}
              title="Click to edit status"
            >
              {bug.status ?? '—'}
            </span>

            <span
              className="tag"
              style={{ cursor: 'pointer' }}
              onClick={() => startEdit('priority')}
              title="Click to edit priority"
            >
              {(bug as any).priority ?? 'Normal'}
            </span>

            <span style={{ marginLeft: 12, color: '#9fb1b6', fontSize: 13 }}>— Click any field to edit</span>
          </div>

          <div className="text-sm text-gray-400">{formatDate(bug.created_at)}</div>
        </div>

        <section className="col" style={{ gap: 8 }}>
          <h2>
            Description <small style={{ color: '#9fb1b6', fontWeight: 400 }}>— Click to edit</small>
          </h2>

          {editableField === 'description' ? (
            <textarea
              ref={descRef}
              value={fieldValue ?? ''}
              onChange={(e) => setFieldValue(e.target.value)}
              onBlur={() => saveField('description')}
              onKeyDown={onDescKey}
              rows={6}
              className="w-full bg-white/5 px-3 py-2 rounded"
            />
          ) : (
            <p onClick={() => startEdit('description')} style={{ whiteSpace: 'pre-wrap', cursor: 'pointer' }}>
              {bug.description || 'No description provided.'}
            </p>
          )}
        </section>

        <section className="col" style={{ gap: 8 }}>
          <h2>
            Reporter <small style={{ color: '#9fb1b6', fontWeight: 400 }}>— Not editable</small>
          </h2>
          <p>
            {renderProfileDisplay((bug as any).reporter_id, (bug as any).reporter_email ?? (bug as any).reporter ?? 'Unknown')}
          </p>
        </section>

        <section className="col" style={{ gap: 8 }}>
          <h2>
            Assignee <small style={{ color: '#9fb1b6', fontWeight: 400 }}>— Click to edit</small>
          </h2>

          {editableField === 'assignee' ? (
            profiles.length > 0 ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select
                  value={(fieldValue as string) ?? ((bug as any).assignee_id ?? '')}
                  onChange={(e) => setFieldValue(e.target.value)}
                  onBlur={() => saveField('assignee')}
                  className="px-3 py-2 bg-white/5 rounded"
                >
                  <option value="">(unassigned)</option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name ?? p.email ?? p.id}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={() => saveField('assignee')} className="btn">Save</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={fieldValue ?? ''}
                  onChange={(e) => setFieldValue(e.target.value)}
                  onBlur={() => saveField('assignee')}
                  placeholder="name or email"
                  className="px-3 py-2 bg-white/5 rounded"
                />
              </div>
            )
          ) : (
            <p onClick={() => startEdit('assignee')} style={{ cursor: 'pointer' }}>
              {renderProfileDisplay((bug as any).assignee_id, (bug as any).assignee ?? 'Unassigned')}
            </p>
          )}
        </section>

        {/* If editing status or priority, show inline selects */}
        {editableField === 'status' && (
          <div>
            <label className="text-sm text-gray-500">Change status</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <select
                value={fieldValue ?? (bug?.status ?? 'Open')}
                onChange={(e) => setFieldValue(e.target.value)}
                onBlur={() => saveField('status')}
                className="px-3 py-2 bg-white/5 rounded"
              >
                <option>Open</option>
                <option>In Progress</option>
                <option>Resolved</option>
                <option>Closed</option>
              </select>
              <button type="button" onClick={() => saveField('status')} className="btn">Save</button>
            </div>
          </div>
        )}

        {editableField === 'priority' && (
          <div>
            <label className="text-sm text-gray-500">Change priority</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <select
                value={fieldValue ?? ((bug as any).priority ?? 'Normal')}
                onChange={(e) => setFieldValue(e.target.value)}
                onBlur={() => saveField('priority')}
                className="px-3 py-2 bg-white/5 rounded"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button type="button" onClick={() => saveField('priority')} className="btn">Save</button>
            </div>
          </div>
        )}

        {fieldError && <div className="text-red-400">{fieldError}</div>}
        {saving && <div className="text-sm text-gray-400">Saving…</div>}

        <div>
          <button onClick={() => router.back()} className="btn">← Back</button>
        </div>
      </div>
    </div>
  )
}

/* helper */
function formatDate(value: any) {
  if (!value) return ''
  try {
    const d = new Date(value)
    return d.toLocaleDateString()
  } catch {
    return String(value)
  }
}
