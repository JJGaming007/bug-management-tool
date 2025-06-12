'use client'
import { FC, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Sprint } from '@/types'

interface SprintSelectorProps {
  value?: number | null
  onChange: (id: number | null) => void
}

export const SprintSelector: FC<SprintSelectorProps> = ({ value, onChange }) => {
  const [sprints, setSprints] = useState<Sprint[]>([])

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('sprints')
        .select('*')
        .order('start_date', { ascending: true })
      if (!error && data) setSprints(data)
    }
    load()
  }, [])

  return (
    <div className="mb-2">
      <label className="block mb-1">Sprint</label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className="px-3 py-1 border rounded-lg w-full"
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
