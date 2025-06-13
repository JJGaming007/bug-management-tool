'use client'
import { FC, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

interface Props {
  value: number | null
  onChange: (v: number | null) => void
}

export const SprintSelector: FC<Props> = ({ value, onChange }) => {
  const [sprints, setSprints] = useState<{ id: number; name: string }[]>([])
  useEffect(() => {
    supabase
      .from('sprints')
      .select('id,name')
      .then(({ data }) => {
        if (data) setSprints(data as any)
      })
  }, [])
  return (
    <div>
      <label className="block mb-1 text-[var(--text)]">Sprint</label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? +e.target.value : null)}
        className="
          w-full px-3 py-2 mb-4
          bg-[var(--bg)] border border-[var(--border)]
          text-[var(--text)] rounded-lg
          focus:outline-none focus:ring focus:ring-[var(--accent-hover)]
        "
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
