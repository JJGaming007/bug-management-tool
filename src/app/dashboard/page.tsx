// src/app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

interface Bug { id: string | number; created_at: string; status: string; priority?: string | null; title: string }

export default function DashboardPage() {
  const [counts, setCounts] = useState({ total: 0, open: 0, in_progress: 0, resolved: 0, closed: 0 })
  const [recent, setRecent] = useState<Bug[]>([])
  const [trend, setTrend] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true); setError(null)
      try {
        const total  = await supabase.from('bugs').select('*', { count: 'exact', head: true })
        const open   = await supabase.from('bugs').select('*', { count: 'exact', head: true }).eq('status', 'open')
        const inprog = await supabase.from('bugs').select('*', { count: 'exact', head: true }).eq('status', 'in_progress')
        const res    = await supabase.from('bugs').select('*', { count: 'exact', head: true }).eq('status', 'resolved')
        const closed = await supabase.from('bugs').select('*', { count: 'exact', head: true }).eq('status', 'closed')

        if (!cancelled) setCounts({
          total: total.count || 0,
          open: open.count || 0,
          in_progress: inprog.count || 0,
          resolved: res.count || 0,
          closed: closed.count || 0,
        })

        const { data: rb } = await supabase.from('bugs').select('*').order('created_at', { ascending: false }).limit(5)
        if (!cancelled) setRecent(rb || [])

        const series: number[] = []
        for (let i = 6; i >= 0; i--) {
          const start = new Date(); start.setHours(0,0,0,0); start.setDate(start.getDate() - i)
          const end = new Date(start); end.setDate(start.getDate() + 1)
          const { count } = await supabase.from('bugs').select('*', { count: 'exact', head: true })
            .gte('created_at', start.toISOString()).lt('created_at', end.toISOString())
          series.push(count || 0)
        }
        if (!cancelled) setTrend(series)
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load dashboard')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="container" style={{ padding: 24 }}>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: .2 }}>Dashboard</h1>

      {/* Stats */}
      <section style={{ marginTop: 16, display: 'grid', gap: 16, gridTemplateColumns: 'repeat(4, minmax(0,1fr))' }}>
        <CardStat label="Open" value={counts.open} />
        <CardStat label="In Progress" value={counts.in_progress} />
        <CardStat label="Resolved" value={counts.resolved} />
        <CardStat label="Closed" value={counts.closed} />
      </section>

      {/* Trend + Recent */}
      <section style={{ marginTop: 16, display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
        <div className="card" style={{ padding: 16, minHeight: 300 }}>
          <h3 style={{ margin: 0, marginBottom: 12 }}>Bug Trends (7 days)</h3>
          {loading ? <div className="skeleton" style={{ height: 240 }} /> :
            error ? <ErrorBox msg={error} /> :
            <TrendBars data={trend} />
          }
        </div>

        <div className="card" style={{ padding: 16 }}>
          <h3 style={{ margin: 0, marginBottom: 12 }}>Recent Bugs</h3>
          {loading ? <div className="skeleton" style={{ height: 260 }} /> :
            <div style={{ display: 'grid', gap: 10 }}>
              {recent.map(b => (
                <div key={String(b.id)} style={{ display: 'flex', justifyContent: 'space-between', border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: '#0b1220' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{b.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--subtext)' }}>{new Date(b.created_at).toLocaleString()}</div>
                  </div>
                  <span className="pill">{b.status}</span>
                </div>
              ))}
              {recent.length === 0 && <div style={{ color: 'var(--subtext)', textAlign: 'center', padding: 20 }}>No recent bugs.</div>}
            </div>
          }
        </div>
      </section>
    </div>
  )
}

function CardStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ color: 'var(--subtext)', fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
    </div>
  )
}

function TrendBars({ data }: { data: number[] }) {
  const max = Math.max(1, ...data)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 220 }}>
      {data.map((v, i) => (
        <div key={i} style={{ width: '100%', background: '#0b1220', border: '1px solid var(--border)', borderRadius: 8, height: `${(v / max) * 100}%` }} />
      ))}
    </div>
  )
}

function ErrorBox({ msg }: { msg: string }) {
  return <div style={{ color: '#fecaca', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.4)', padding: 12, borderRadius: 12 }}>{msg}</div>
}
