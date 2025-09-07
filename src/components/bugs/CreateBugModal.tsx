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

export default function CreateBugModal({ isOpen, onClose, onCreated }: Props) {
  const { user } = (useAuth() as { user: any }) || { user: null }
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [labelsText, setLabelsText] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [dueDate, setDueDate] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // prevent background scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = prev
    }
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  // close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) {
      setTitle('')
      setDescription('')
      setLabelsText('')
      setPriority('medium')
      setDueDate('')
      setError(null)
      setBusy(false)
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

  /**
   * Try inserting payload. If supabase complains about missing schema columns,
   * remove those optional columns from payload and retry once.
   *
   * Optional fields handled: labels, due_date, reporter_email
   */
  async function safeInsert(payload: Record<string, any>) {
    // first attempt
    const { data, error: supError } = await supabase.from('bugs').insert([payload]).select().single()
    if (!supError) return { data, error: null }

    const message = (supError.message || '').toLowerCase()

    // Optional fields to tolerate if missing in DB schema
    const optionalFields = ['labels', 'due_date', 'reporter_email']
    const fieldsMentioned: string[] = []

    for (const f of optionalFields) {
      // Look for common error phrasing referencing the missing column
      // e.g. "Could not find the 'labels' column of 'bugs' in the schema cache"
      if (
        message.includes(`'${f}'`) ||
        message.includes(`${f} column`) ||
        message.includes(`could not find the ${f}`) ||
        message.includes(`${f} of 'bugs'`)
      ) {
        fieldsMentioned.push(f)
      }
    }

    if (fieldsMentioned.length === 0) {
      // Not a schema-missing error we can auto-fix
      return { data: null, error: supError }
    }

    // Remove the offending fields and retry once
    const cleaned = { ...payload }
    for (const f of fieldsMentioned) {
      if (f in cleaned) delete cleaned[f]
    }

    const retry = await supabase.from('bugs').insert([cleaned]).select().single()
    if (retry.error) {
      // return the retry error (if still failing)
      return { data: null, error: retry.error }
    }
    return { data: retry.data, error: null }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Title is required')
      return
    }
    if (!description.trim()) {
      setError('Description is required')
      return
    }

    // Ensure we have a signed-in user and a reporter id for NOT NULL constraint
    if (!user?.id) {
      setError('You must be signed in to create a bug.')
      return
    }

    const payload: any = {
      title: title.trim(),
      description: description.trim(),
      // default to "Open" to match your DB enum (avoid "new")
      status: 'Open',
      priority,
      // include the reporter id (satisfy NOT NULL constraint)
      reporter_id: user.id,
    }

    // include optional fields in payload if provided
    if (dueDate) payload.due_date = dueDate
    if (labels.length) payload.labels = labels
    // reporter_email kept as optional (some schemas may have it)
    if (user?.email) payload.reporter_email = user.email

    try {
      setBusy(true)

      const { data, error: insertError } = await safeInsert(payload)

      if (insertError) {
        // Provide a friendly message but show supabase text for debugging
        setError(insertError.message || 'Failed to create bug')
        return
      }

      onCreated?.(data as Bug)
      onClose()
    } catch (ex: any) {
      setError(ex?.message || 'Unexpected error')
    } finally {
      setBusy(false)
    }
  }

  if (!isOpen || !mounted) return null

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      onMouseDown={(e) => {
        // close when clicking on the overlay (but not when clicking inside the panel)
        if (e.target === e.currentTarget) onClose()
      }}
      style={{ outline: 'none' }}
    >
      {/* overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
        }}
      />

      {/* panel: absolutely centered and independent of parent stacking contexts */}
      <div
        role="document"
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10001,
          width: 'min(880px, 96%)',
          maxHeight: '90vh',
          overflow: 'auto',
          borderRadius: 14,
          boxShadow: '0 18px 40px rgba(2,6,23,0.8)',
          background: 'linear-gradient(180deg, rgba(10,14,18,0.98), rgba(8,10,12,0.98))',
          border: '1px solid rgba(255,255,255,0.03)',
        }}
      >
        {/* header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 22px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
          <h3 style={{ margin: 0, color: '#e6eef2' }}>Create Bug</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            type="button"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#c9d6da',
              fontSize: 18,
              cursor: 'pointer',
              padding: 6,
              borderRadius: 8,
            }}
          >
            ✕
          </button>
        </div>

        {/* body */}
        <form onSubmit={handleCreate} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{ background: 'rgba(255, 13, 13, 0.06)', color: '#ffb3b3', padding: 10, borderRadius: 8 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ color: '#9fb1b6', fontSize: 13 }}>Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short descriptive title"
              disabled={busy}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.02)',
                color: '#e6eef2',
                border: '1px solid rgba(255,255,255,0.03)',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ color: '#9fb1b6', fontSize: 13 }}>Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder="Describe the bug, steps to reproduce..."
              disabled={busy}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.02)',
                color: '#e6eef2',
                border: '1px solid rgba(255,255,255,0.03)',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ color: '#9fb1b6', fontSize: 13 }}>Labels (comma separated)</label>
            <input
              value={labelsText}
              onChange={(e) => setLabelsText(e.target.value)}
              placeholder="ui, android, high-priority"
              disabled={busy}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.02)',
                color: '#e6eef2',
                border: '1px solid rgba(255,255,255,0.03)',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ color: '#9fb1b6', fontSize: 13 }}>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                disabled={busy}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.02)',
                  color: '#e6eef2',
                  border: '1px solid rgba(255,255,255,0.03)',
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div style={{ width: 220 }}>
              <label style={{ color: '#9fb1b6', fontSize: 13 }}>Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={busy}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.02)',
                  color: '#e6eef2',
                  border: '1px solid rgba(255,255,255,0.03)',
                }}
              />
            </div>
          </div>

          {/* actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 6 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.05)',
                color: '#cfe8e8',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={busy}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                background: 'linear-gradient(90deg,#06b6d4,#06b6d4)',
                color: '#062022',
                fontWeight: 600,
                border: 'none',
                cursor: busy ? 'not-allowed' : 'pointer',
                boxShadow: '0 6px 18px rgba(6,182,212,0.16)',
              }}
            >
              {busy ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
