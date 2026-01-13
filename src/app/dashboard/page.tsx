'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'

interface Bug {
  id: string | number
  created_at: string
  status: string
  priority?: string | null
  title: string
}

// Icons
const TrendUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
)

const AlertCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const ArchiveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="5" x="2" y="3" rx="1" />
    <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
    <path d="M10 12h4" />
  </svg>
)

export default function DashboardPage() {
  const router = useRouter()
  const [counts, setCounts] = useState({ total: 0, open: 0, in_progress: 0, resolved: 0, closed: 0 })
  const [recent, setRecent] = useState<Bug[]>([])
  const [trend, setTrend] = useState<{ day: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)

      if (!isSupabaseConfigured) {
        setLoading(false)
        return
      }

      try {
        const [total, open, inprog, res, closed] = await Promise.all([
          supabase.from('bugs').select('*', { count: 'exact', head: true }),
          supabase.from('bugs').select('*', { count: 'exact', head: true }).ilike('status', '%open%'),
          supabase.from('bugs').select('*', { count: 'exact', head: true }).ilike('status', '%progress%'),
          supabase.from('bugs').select('*', { count: 'exact', head: true }).ilike('status', '%resolved%'),
          supabase.from('bugs').select('*', { count: 'exact', head: true }).ilike('status', '%closed%'),
        ])

        if (!cancelled) {
          setCounts({
            total: total.count || 0,
            open: open.count || 0,
            in_progress: inprog.count || 0,
            resolved: res.count || 0,
            closed: closed.count || 0,
          })
        }

        const { data: rb } = await supabase
          .from('bugs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5)
        if (!cancelled) setRecent(rb || [])

        // Get trend data for last 7 days
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const series: { day: string; count: number }[] = []
        for (let i = 6; i >= 0; i--) {
          const start = new Date()
          start.setHours(0, 0, 0, 0)
          start.setDate(start.getDate() - i)
          const end = new Date(start)
          end.setDate(start.getDate() + 1)
          const { count } = await supabase
            .from('bugs')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', start.toISOString())
            .lt('created_at', end.toISOString())
          series.push({ day: days[start.getDay()], count: count || 0 })
        }
        if (!cancelled) setTrend(series)
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to load dashboard'
        if (!cancelled) setError(errorMessage)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const stats = [
    {
      label: 'Open',
      value: counts.open,
      icon: AlertCircleIcon,
      color: 'var(--status-open)',
      bgColor: 'var(--status-open-bg)',
    },
    {
      label: 'In Progress',
      value: counts.in_progress,
      icon: ClockIcon,
      color: 'var(--status-progress)',
      bgColor: 'var(--status-progress-bg)',
    },
    {
      label: 'Resolved',
      value: counts.resolved,
      icon: CheckCircleIcon,
      color: 'var(--status-resolved)',
      bgColor: 'var(--status-resolved-bg)',
    },
    {
      label: 'Closed',
      value: counts.closed,
      icon: ArchiveIcon,
      color: 'var(--status-closed)',
      bgColor: 'var(--status-closed-bg)',
    },
  ]

  const getStatusBadgeClass = (status: string) => {
    const s = status?.toLowerCase() || ''
    if (s.includes('open')) return 'badge-open'
    if (s.includes('progress')) return 'badge-progress'
    if (s.includes('resolved')) return 'badge-resolved'
    if (s.includes('closed')) return 'badge-closed'
    return 'badge-open'
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const maxTrend = Math.max(1, ...trend.map((t) => t.count))

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your bug tracking activity</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="stat-label">{stat.label}</span>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    background: stat.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: stat.color,
                  }}
                >
                  <Icon />
                </div>
              </div>
              <div className="stat-value">{loading ? '-' : stat.value}</div>
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Trend Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Bug Trends (7 days)</span>
            <div className="stat-trend up">
              <TrendUpIcon />
              <span>Activity</span>
            </div>
          </div>
          <div className="card-body">
            {loading ? (
              <div style={{ height: '200px' }} className="skeleton" />
            ) : error ? (
              <div className="alert alert-error">{error}</div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '200px', paddingTop: '20px' }}>
                {trend.map((t, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '100%',
                        background: `linear-gradient(180deg, var(--accent-primary), var(--accent-secondary))`,
                        borderRadius: 'var(--radius-sm)',
                        height: `${Math.max(4, (t.count / maxTrend) * 160)}px`,
                        transition: 'height 0.3s ease',
                        opacity: t.count === 0 ? 0.3 : 1,
                      }}
                    />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.day}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Bugs */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Bugs</span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => router.push('/bugs')}
            >
              View all
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {loading ? (
              <div style={{ padding: '20px' }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="skeleton" style={{ height: '48px', marginBottom: '8px' }} />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <AlertCircleIcon />
                <div className="empty-state-title">No bugs yet</div>
                <div className="empty-state-description">Create your first bug to get started</div>
              </div>
            ) : (
              <div>
                {recent.map((bug, index) => (
                  <div
                    key={bug.id}
                    onClick={() => router.push(`/bugs/${bug.id}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 20px',
                      cursor: 'pointer',
                      borderBottom: index < recent.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px' }}>
                        {bug.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {formatDate(bug.created_at)}
                      </div>
                    </div>
                    <span className={`badge ${getStatusBadgeClass(bug.status)}`}>
                      {bug.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ marginTop: '24px' }}>
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Total Bugs Tracked
                </div>
                <div style={{ fontSize: '28px', fontWeight: 700 }}>{loading ? '-' : counts.total}</div>
              </div>
              <div style={{ display: 'flex', gap: '32px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--status-open)' }}>
                    {loading ? '-' : Math.round((counts.open / Math.max(1, counts.total)) * 100)}%
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Open Rate</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--status-resolved)' }}>
                    {loading ? '-' : Math.round((counts.resolved / Math.max(1, counts.total)) * 100)}%
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Resolved Rate</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--status-closed)' }}>
                    {loading ? '-' : Math.round((counts.closed / Math.max(1, counts.total)) * 100)}%
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Closed Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
