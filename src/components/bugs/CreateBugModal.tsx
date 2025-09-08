// src/components/bugs/CreateBugModal.tsx
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

const ATTACHMENT_BUCKET = 'bug-attachments' // adjust to your storage bucket

export default function CreateBugModal({ isOpen, onClose, onCreated }: Props) {
  const { user } = (useAuth() as { user: any }) || { user: null }
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [stepsToReproduce, setStepsToReproduce] = useState('')
  const [expectedResult, setExpectedResult] = useState('')
  const [actualResult, setActualResult] = useState('')
  const [environment, setEnvironment] = useState('')
  const [device, setDevice] = useState('')
  const [labelsText, setLabelsText] = useState('')
  const [priority, setPriority] = useState<'low'|'medium'|'high'>('medium')
  const [severity, setSeverity] = useState<'minor'|'major'|'critical'>('major')
  const [dueDate, setDueDate] = useState('')
  const [assigneeId, setAssigneeId] = useState<string | null>(null)
  const [sprintId, setSprintId] = useState<string | null>(null)
  const [files, setFiles] = useState<FileList | null>(null)

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [profiles, setProfiles] = useState<{id:string; full_name?:string|null; email?:string|null}[]>([])
  const [sprints, setSprints] = useState<any[]>([])

  useEffect(() => {
    // load selectable profiles & sprints for modal when it opens
    async function load() {
      try {
        const { data: profs } = await supabase.from('profiles').select('id, full_name, email').order('full_name', { ascending: true })
        setProfiles(profs || [])
        const { data: s } = await supabase.from('sprints').select('id, name').order('name', { ascending: true })
        setSprints(s || [])
      } catch (e) {
        // ignore silently
      }
    }
    if (isOpen) load()
  }, [isOpen])

  // prevent background scroll while modal open
  useEffect(() => {
    const prev = document.body.style.overflow
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = prev
    return () => { document.body.style.overflow = prev }
  }, [isOpen])

  // clear when closed
  useEffect(() => {
    if (!isOpen) {
      setTitle(''); setDescription(''); setStepsToReproduce(''); setExpectedResult(''); setActualResult('')
      setEnvironment(''); setDevice(''); setLabelsText(''); setPriority('medium'); setSeverity('major')
      setDueDate(''); setAssigneeId(null); setSprintId(null); setFiles(null); setError(null)
    }
  }, [isOpen])

  const labels = useMemo(
    () => labelsText.split(',').map(s => s.trim()).filter(Boolean),
    [labelsText]
  )

  async function safeInsertBug(payload: Record<string, any>) {
    const optionalFields = ['labels','due_date','reporter_email','sprint_id','assignee_id','severity','environment','device','steps_to_reproduce','expected_result','actual_result']
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

  async function handleCreate(e?: React.FormEvent) {
    e?.preventDefault()
    setError(null)
    if (!title.trim()) { setError('Title required'); return }
    if (!description.trim()) { setError('Description required'); return }
    if (!user?.id) { setError('You must be signed in to create a bug'); return }

    setBusy(true)
    try {
      const payload: any = {
        title: title.trim(),
        description: description.trim(),
        status: 'Open',
        priority,
        severity,
        reporter_id: user.id,
      }
      if (labels.length) payload.labels = labels
      if (dueDate) payload.due_date = dueDate
      if (assigneeId) payload.assignee_id = assigneeId
      if (sprintId) payload.sprint_id = sprintId
      if (environment) payload.environment = environment
      if (device) payload.device = device
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

      // record creation activity
      await supabase.from('bug_activities').insert({
        bug_id: createdBug.id,
        actor_id: user.id,
        action: 'created_bug',
        metadata: { title: createdBug.title, priority, severity }
      }).catch(()=>{})

      // upload attachments (if any)
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const path = `${createdBug.id}/${Date.now()}_${file.name}`
          const { error: upErr } = await supabase.storage.from(ATTACHMENT_BUCKET).upload(path, file)
          if (upErr) {
            console.error('upload error', upErr)
            setError(prev => prev ? prev + '; ' + upErr.message : 'Upload failed: ' + upErr.message)
            continue
          }
          const { error: metaErr } = await supabase.from('bug_attachments').insert({
            bug_id: createdBug.id,
            filename: file.name,
            file_path: path,
            file_size: file.size,
            mime_type: file.type,
            uploaded_by: user.id
          })
          if (metaErr) {
            console.error('metadata insert error', metaErr)
            setError(prev => prev ? prev + '; ' + metaErr.message : 'Failed saving attachment metadata')
          } else {
            await supabase.from('bug_activities').insert({
              bug_id: createdBug.id,
              actor_id: user.id,
              action: 'uploaded_attachment',
              metadata: { filename: file.name }
            }).catch(()=>{})
          }
        }
      }

      onCreated?.(createdBug)
      onClose()
    } catch (ex: any) {
      setError(ex?.message || 'Unexpected error')
    } finally {
      setBusy(false)
    }
  }

  // EARLY RETURNS:
  // if modal is closed, nothing to render
  if (!isOpen) return null

  // guard against SSR / env without document
  if (typeof window === 'undefined' || typeof document === 'undefined') return null

  // debug helper: shows up in console when modal render path runs
  // remove when done debugging
  // eslint-disable-next-line no-console
  console.log('CreateBugModal render (isOpen=true)')

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center" aria-modal="true" role="dialog">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div className="relative w-full max-w-3xl mx-4 bg-[linear-gradient(180deg,rgba(10,14,18,0.98),rgba(8,10,12,0.98))] border border-white/5 rounded-2xl shadow-xl overflow-auto max-h-[90vh]">
        {/* header */}
        <div className="px-6 py-4 border-b border-white/6 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-100">Create Bug</h3>
          <button onClick={onClose} className="text-slate-300 hover:text-white rounded-md p-1">✕</button>
        </div>

        {/* body */}
        <form onSubmit={handleCreate} className="p-6 space-y-4">
          {error && <div className="bg-rose-900/20 border border-rose-800 text-rose-200 rounded-md p-3">{error}</div>}

          <div>
            <label className="text-sm text-slate-300">Title *</label>
            <input className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/6 text-slate-100"
              value={title} onChange={(e)=>setTitle(e.target.value)} disabled={busy} />
          </div>

          <div>
            <label className="text-sm text-slate-300">Description *</label>
            <textarea className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/6 text-slate-100" rows={4}
              value={description} onChange={(e)=>setDescription(e.target.value)} disabled={busy} />
          </div>

          {/* rest of the form (same as before) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-300">Steps to reproduce</label>
              <textarea className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/6 text-slate-100" rows={3}
                value={stepsToReproduce} onChange={(e)=>setStepsToReproduce(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-slate-300">Environment</label>
              <input className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/6 text-slate-100"
                value={environment} onChange={(e)=>setEnvironment(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-slate-300">Priority</label>
              <select className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/6 text-slate-100"
                value={priority} onChange={(e)=>setPriority(e.target.value as any)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-300">Severity</label>
              <select className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/6 text-slate-100"
                value={severity} onChange={(e)=>setSeverity(e.target.value as any)}>
                <option value="minor">Minor</option>
                <option value="major">Major</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-300">Assignee</label>
              <select className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/6 text-slate-100"
                value={assigneeId ?? ''} onChange={(e)=>setAssigneeId(e.target.value || null)}>
                <option value="">(Unassigned)</option>
                {profiles.map(p => <option value={p.id} key={p.id}>{p.full_name ?? p.email ?? p.id}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-slate-300">Due date</label>
              <input type="date" className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/6 text-slate-100"
                value={dueDate} onChange={(e)=>setDueDate(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-slate-300">Sprint</label>
              <select className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/6 text-slate-100"
                value={sprintId ?? ''} onChange={(e)=>setSprintId(e.target.value || null)}>
                <option value="">(None)</option>
                {sprints.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-300">Device</label>
              <input className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/6 text-slate-100"
                value={device} onChange={(e)=>setDevice(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-300">Expected result</label>
            <textarea className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/6 text-slate-100" rows={2}
              value={expectedResult} onChange={(e)=>setExpectedResult(e.target.value)} />
          </div>

          <div>
            <label className="text-sm text-slate-300">Actual result</label>
            <textarea className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/6 text-slate-100" rows={2}
              value={actualResult} onChange={(e)=>setActualResult(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-300">Labels (comma separated)</label>
              <input className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/6 text-slate-100"
                value={labelsText} onChange={(e)=>setLabelsText(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-slate-300">Attachments</label>
              <input type="file" multiple className="mt-1 w-full text-slate-300" onChange={(e)=>setFiles(e.target.files)} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-white/6 text-slate-200" disabled={busy}>Cancel</button>
            <button type="submit" disabled={busy} className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-900 font-semibold shadow">
              {busy ? 'Creating…' : 'Create Bug'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
