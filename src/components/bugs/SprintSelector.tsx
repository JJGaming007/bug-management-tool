// src/components/bugs/SprintSelector.tsx
'use client'

import { FC, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { definitions as DB } from '@/types/database'

type Sprint = DB['sprints']

interface Props {
  value: number | null
  onChange: (id: number | null) => void
}

export const SprintSelector: FC<Props> = ({ value, onChange }) => {
  const [sprints, setSprints] = useState<Sprint[]>([])

  useEffect(() => {
    supabase
      .from('sprints')
      .select('id, name')
      .order('start_date', { ascending: true })
      .then(({ data }) => {
        if (data) setSprints(data)
      })
  }, [])

  return (
    <div>
      <label className="block mb-1">Sprint</label>
      <select
        value={value ?? ''}
        onChange={(e) =>
          onChange(e.target.value ? Number(e.target.value) : null)
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
