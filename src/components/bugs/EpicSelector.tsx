'use client'
import { FC, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

interface Props {
  value: number | null
  onChange: (v: number | null) => void
}

export const EpicSelector: FC<Props> = ({ value, onChange }) => {
  const [epics, setEpics] = useState<{ id: number; name: string }[]>([])
  useEffect(() => {
    supabase
      .from('bugs')
      .select('id,name')
      .eq('issue_type', 'Epic')
      .then(({ data }) => {
        if (data) setEpics(data as any)
      })
  }, [])
  return (
    <div>
      <label className="block mb-1 text-[var(--text)]">Epic</label>
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
        {epics.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name}
          </option>
        ))}
      </select>
    </div>
  )
}
