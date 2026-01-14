// src/components/bugs/SprintSelector.tsx
'use client'

import { FC, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Sprint } from '@/types'

interface Props {
  value: string | null
  onChange: (id: string | null) => void
}

export const SprintSelector: FC<Props> = ({ value, onChange }) => {
  const [sprints, setSprints] = useState<Sprint[]>([])

  useEffect(() => {
    supabase
      .from('sprints')
      .select('*')
      .order('start_date', { ascending: true })
      .then(({ data }) => {
        if (data) setSprints(data as Sprint[])
      })
  }, [])

  return (
    <div>
      <label className="block mb-1">Sprint</label>
      <select
        value={value ?? ''}
        onChange={(e) =>
          onChange(e.target.value || null)
        }
        className="w-full px-3 py-2 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring focus:ring-[var(--accent-hover)]"
      >
        <option value="">None</option>
        {sprints.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </div>
  )
}
