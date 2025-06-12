'use client'
import { FC, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Epic } from '@/types'

interface EpicSelectorProps {
  value?: number | null
  onChange: (id: number | null) => void
}

export const EpicSelector: FC<EpicSelectorProps> = ({ value, onChange }) => {
  const [epics, setEpics] = useState<Epic[]>([])

  useEffect(() => {
    supabase
      .from('epics')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setEpics(data)
      })
  }, [])

  return (
    <div className="mb-2">
      <label className="block mb-1 font-medium">Epic</label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? +e.target.value : null)}
        className="w-full px-3 py-2 border rounded-lg"
      >
        <option value="">None</option>
        {epics.map((epic) => (
          <option key={epic.id} value={epic.id}>
            {epic.key}: {epic.name}
          </option>
        ))}
      </select>
    </div>
  )
}
