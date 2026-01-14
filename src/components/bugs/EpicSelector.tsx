// src/components/bugs/EpicSelector.tsx
'use client'

import { FC, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Epic } from '@/types'

interface Props {
  value: string | null
  onChange: (id: string | null) => void
}

export const EpicSelector: FC<Props> = ({ value, onChange }) => {
  const [epics, setEpics] = useState<Epic[]>([])

  useEffect(() => {
    supabase.from('epics').select('*').then(({ data }) => {
      if (data) setEpics(data as Epic[])
    })
  }, [])

  return (
    <div>
      <label className="block mb-1">Epic</label>
      <select
        value={value ?? ''}
        onChange={(e) =>
          onChange(e.target.value || null)
        }
        className="w-full px-3 py-2 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring focus:ring-[var(--accent-hover)]"
      >
        <option value="">None</option>
        {epics.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name}
          </option>
        ))}
      </select>
    </div>
  )
}
