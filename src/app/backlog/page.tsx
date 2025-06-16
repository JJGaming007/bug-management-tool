'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { IssueCard } from '@/components/bugs/IssueCard'
import type { Bug } from '@/types'
import RequireAuth from '@/components/ui/RequireAuth'

export default function BacklogPage() {
  return (
    <RequireAuth>
      <InnerBacklogPage />
    </RequireAuth>
  )
}

function InnerBacklogPage() {
  const [bugs, setBugs] = useState<Bug[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('bugs')
      .select('*')
      .is('sprint_id', null)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error)
        else setBugs(data || [])
        setLoading(false)
      })
  }, [])

  if (loading) return <div>Loading backlog…</div>

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Backlog</h1>
      <div className="space-y-4">
        {bugs.map((b) => (
          <IssueCard key={b.id} bug={b} />
        ))}
      </div>
    </div>
  )
}
