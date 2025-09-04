// src/app/bugs/page.tsx
'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useBugs } from '@/hooks/useBugs'
import { NewBugModal } from '@/components/bugs/NewBugModal'

export default function BugsPage() {
  const { data: bugs = [], isLoading, error, refetch } = useBugs()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return bugs
    return bugs.filter((b: any) =>
      String(b.title || '').toLowerCase().includes(s) ||
      String(b.description || '').toLowerCase().includes(s)
    )
  }, [bugs, q])

  return (
    <div className="container" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Bugs</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={() => setOpen(true)}>+ New Bug</button>
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
        <input className="input" placeholder="Search bugs…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div style={{ marginTop: 16 }}>
        {isLoading && <div className="skeleton" style={{ height: 240 }} />}
        {error && <div style={{ color: '#fecaca', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.4)', padding: 12, borderRadius: 12 }}>Failed to load bugs</div>}

        {!isLoading && !error && (
          <div className="table">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assignee</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b: any) => (
                  <tr key={String(b.id)}>
                    <td><Link href={`/bugs/${b.id}`} style={{ textDecoration: 'underline' }}>{b.title}</Link></td>
                    <td><span className="pill">{b.status}</span></td>
                    <td><span className="pill">{b.priority || '—'}</span></td>
                    <td>{b.assignee || '—'}</td>
                    <td>{new Date(b.created_at).toLocaleString()}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--subtext)', padding: 24 }}>No bugs match your search.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <NewBugModal isOpen={open} onClose={() => setOpen(false)} onCreated={refetch} />
    </div>
  )
}
