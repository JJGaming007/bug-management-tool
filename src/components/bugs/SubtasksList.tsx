'use client'
import { FC, useEffect, useState } from 'react'
import type { Bug } from '@/types'
import { supabase } from '@/lib/supabase/client'

interface SubtasksListProps {
  parentId: number
}

export const SubtasksList: FC<SubtasksListProps> = ({ parentId }) => {
  const [subs, setSubs] = useState<Bug[]>([])
  useEffect(() => {
    supabase
      .from<Bug>('bugs')
      .select('*')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setSubs(data)
      })
  }, [parentId])

  if (subs.length === 0) return null
  return (
    <div className="mt-4">
      <h4 className="font-medium mb-2">Sub-tasks</h4>
      <ul className="space-y-2">
        {subs.map((st) => (
          <li
            key={st.id}
            className="px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg"
          >
            <strong>#{st.id}</strong> {st.title} ({st.status})
          </li>
        ))}
      </ul>
    </div>
  )
}
