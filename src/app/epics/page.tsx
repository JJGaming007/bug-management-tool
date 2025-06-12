'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Epic } from '@/types'

export default function EpicsPage() {
  const [epics, setEpics] = useState<Epic[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [key, setKey] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    supabase
      .from('epics')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setEpics(data)
        setLoading(false)
      })
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    await supabase.from('epics').insert({
      name,
      key,
      description,
    })
    setName('')
    setKey('')
    setDescription('')
    const { data } = await supabase
      .from('epics')
      .select('*')
      .order('created_at', { ascending: true })
    setEpics(data || [])
  }

  if (loading) return <div>Loading epics…</div>

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Epics</h1>
      <form onSubmit={handleCreate} className="mb-6 space-y-4">
        <div>
          <label className="block mb-1">Key</label>
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="e.g. PROJ"
          />
        </div>
        <div>
          <label className="block mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-[var(--accent)] text-black rounded-lg">
          Create Epic
        </button>
      </form>
      <ul className="space-y-3">
        {epics.map((epic) => (
          <li key={epic.id} className="card flex justify-between items-center">
            <div>
              <span className="font-bold">{epic.key}</span> — {epic.name}
            </div>
            <div className="text-sm text-[var(--subtext)]">
              {new Date(epic.created_at).toLocaleDateString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
