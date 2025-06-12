'use client'
import { FC, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/context/AuthContext'
import type { SavedFilter } from '@/types'

interface SaveFilterProps {
  search: string
  statusFilter: string[]
  priorityFilter: string[]
  onApply: (f: { search: string; status: string[]; priority: string[] }) => void
}

export const SaveFilter: FC<SaveFilterProps> = ({
  search,
  statusFilter,
  priorityFilter,
  onApply,
}) => {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [saved, setSaved] = useState<SavedFilter[]>([])

  // load existing saved filters
  useEffect(() => {
    ;(async () => {
      const { data } = await supabase
        .from('saved_filters')
        .select('*')
        .order('created_at', { ascending: false })
      setSaved(data || [])
    })()
  }, [])

  const handleSave = async () => {
    if (!user || !name.trim()) return
    await supabase.from('saved_filters').insert([
      {
        user_email: user.email!,
        name: name.trim(),
        search,
        status_filter: statusFilter,
        priority_filter: priorityFilter,
      },
    ])
    setName('')
    // reload
    const { data } = await supabase
      .from('saved_filters')
      .select('*')
      .order('created_at', { ascending: false })
    setSaved(data || [])
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <input
        type="text"
        placeholder="Filter name…"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="px-3 py-1 border rounded-lg flex-1"
      />
      <button onClick={handleSave} className="px-4 py-1 bg-[var(--accent)] text-black rounded-lg">
        Save
      </button>

      <select
        onChange={(e) => {
          const f = saved.find((s) => s.id === +e.target.value)
          if (f) {
            onApply({
              search: f.search,
              status: f.status_filter,
              priority: f.priority_filter,
            })
          }
        }}
        defaultValue=""
        className="px-3 py-1 border rounded-lg"
      >
        <option value="">Apply saved filter…</option>
        {saved.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
    </div>
  )
}
