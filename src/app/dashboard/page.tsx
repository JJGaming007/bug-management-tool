// src/app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { BugChart } from '@/components/dashboard/BugChart'
import { RecentBugs } from '@/components/dashboard/RecentBugs'
import  RequireAuth  from '@/components/ui/RequireAuth'  // ← named import

interface Counts {
  total: number
  open: number
  in_progress: number
  closed: number
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <InnerDashboard />
    </RequireAuth>
  )
}

function InnerDashboard() {
  const [counts, setCounts] = useState<Counts>({
    total: 0,
    open: 0,
    in_progress: 0,
    closed: 0,
  })
  const [recent, setRecent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<number[]>([])

  useEffect(() => {
    async function load() {
      // Fetch counts
      const { data: all, error: errAll } = await supabase
        .from('bugs')
        .select('status', { count: 'exact' })
      if (!errAll && all) {
        const tally = all.reduce(
          (acc, row) => {
            const key = row.status
              .toLowerCase()
              .replace(' ', '_') as keyof Counts
            if (acc[key] != null) acc[key]++
            return acc
          },
          { total: all.length, open: 0, in_progress: 0, closed: 0 }
        )
        setCounts(tally)
      }

      // Fetch recent (last 5)
      const { data: rec, error: errRec } = await supabase
        .from('bugs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
      if (!errRec && rec) setRecent(rec)

      // Trend: past 7 days
      const days: number[] = []
      for (let i = 6; i >= 0; i--) {
        const day = new Date()
        day.setDate(day.getDate() - i)
        const dateString = day.toISOString().split('T')[0]
        const { count } = await supabase
          .from('bugs')
          .select('*', { count: 'exact', head: true })
          .eq('created_at', dateString, { cast: 'date' })
        days.push(count || 0)
      }
      setChartData(days)

      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 animate-pulse"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <Breadcrumbs />

      <h1 className="text-2xl font-semibold text-[var(--text)] mb-6">
        Dashboard
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 px-4">
        {[
          { label: 'Total', value: counts.total, accent: 'var(--text)' },
          { label: 'Open', value: counts.open, accent: '#ef4444' },
          {
            label: 'In Progress',
            value: counts.in_progress,
            accent: '#facc15',
          },
          { label: 'Closed', value: counts.closed, accent: '#22c55e' },
        ].map(({ label, value, accent }) => (
          <div
            key={label}
            className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6 flex flex-col items-center"
          >
            <span className="text-sm mb-2">{label}</span>
            <span className="text-3xl font-bold" style={{ color: accent }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Charts & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 pb-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-[var(--text)]">
            Bug Trends
          </h2>
          <BugChart data={chartData} />
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-[var(--text)]">
            Recent Bugs
          </h2>
          <RecentBugs bugs={recent} />
        </div>
      </div>
    </div>
  )
}
