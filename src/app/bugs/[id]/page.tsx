// src/app/bugs/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { notFound, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function BugDetailPage() {
  const { id } = useParams() as { id: string }
  const [bug, setBug] = useState<any>(null)
  const [activity, setActivity] = useState<any[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true); setError(null)
      try {
        const { data, error } = await supabase.from('bugs').select('*').eq('id', id).single()
        if (error) throw error
        if (!cancelled) setBug(data)

        const { data: acts } = await supabase.from('activity_logs').select('*').eq('bug_id', id).order('created_at', { ascending: false })
        if (!cancelled) setActivity(acts || [])

        const { data: cmts } = await supabase.from('comments').select('*').eq('bug_id', id).order('created_at', { ascending: true })
        if (!cancelled) setComments(cmts || [])
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Not found')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id])

  if (!loading && (error || !bug)) notFound()

  return (
    <div className="container" style={{ padding: 24 }}>
      {loading && <div className="skeleton" style={{ height: 200 }} />}
      {!loading && bug && (
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '2fr 1fr' }}>
          {/* Left: Overview & Comments */}
          <div className="card" style={{ padding: 16 }}>
            <h1 style={{ margin: 0 }}>{bug.title}</h1>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <span className="pill">{bug.status}</span>
              {bug.priority && <span className="pill">{bug.priority}</span>}
              {bug.assignee && <span className="pill">Assignee: {bug.assignee}</span>}
            </div>

            <div className="hr" style={{ margin: '16px 0' }} />

            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{bug.description || '—'}</div>

            <div className="hr" style={{ margin: '16px 0' }} />

            <h3 style={{ marginTop: 0 }}>Comments</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              {comments.map((c) => (
                <div key={c.id} style={{ background: '#0b1220', border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>
                  <div style={{ fontSize: 12, color: 'var(--subtext)' }}>{new Date(c.created_at).toLocaleString()}</div>
                  <div style={{ marginTop: 6 }}>{c.body}</div>
                </div>
              ))}
              {comments.length === 0 && <div style={{ color: 'var(--subtext)' }}>No comments yet.</div>}
            </div>
          </div>

          {/* Right: Activity */}
          <div className="card" style={{ padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>Activity</h3>
            <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
              {activity.map(a => (
                <div key={a.id} style={{ display: 'grid', gap: 6, background: '#0b1220', border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>
                  <div style={{ fontSize: 12, color: 'var(--subtext)' }}>{new Date(a.created_at).toLocaleString()}</div>
                  <div style={{ fontWeight: 600 }}>{a.action}</div>
                  {a.field_name && <div style={{ fontSize: 12 }}>Field: {a.field_name}</div>}
                  {(a.old_value || a.new_value) && (
                    <div style={{ fontSize: 12, color: 'var(--subtext)' }}>
                      {a.old_value ?? '—'} → {a.new_value ?? '—'}
                    </div>
                  )}
                </div>
              ))}
              {activity.length === 0 && <div style={{ color: 'var(--subtext)' }}>No activity yet.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
