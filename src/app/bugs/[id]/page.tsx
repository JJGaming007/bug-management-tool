'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import  RequireAuth  from '@/components/ui/RequireAuth' 
import { IssueDetail } from '@/components/bugs/IssueDetail'
import type { Bug } from '@/types'

export default function BugDetailPage() {
  return (
    <RequireAuth>
      <InnerBugDetailPage />
    </RequireAuth>
  )
}

function InnerBugDetailPage() {
  const pathname = usePathname() // e.g. '/bugs/[id]'
  const id = pathname.split('/').pop()!
  const [bug, setBug] = useState<Bug | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    supabase
      .from('bugs')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) console.error(error)
        else setBug(data)
        setLoading(false)
      })
  }, [id])

  if (loading) return <div>Loading issue…</div>
  if (!bug) return <div>Issue not found.</div>

  return <IssueDetail bug={bug} />
}
