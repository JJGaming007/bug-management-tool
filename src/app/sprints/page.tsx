'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Sprint } from '@/types'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import  RequireAuth  from '@/components/ui/RequireAuth'

export default function SprintsPage() {
  return (
    <RequireAuth>
      <InnerSprintsPage />
    </RequireAuth>
  )
}

function InnerSprintsPage() {
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const load = async () => {
    const { data, error } = await supabase
      .from('sprints')
      .select('*')
      .order('start_date', { ascending: true })
    if (!error && data) setSprints(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !startDate || !endDate) return
    const { error } = await supabase.from('sprints').insert({
      name,
      start_date: startDate,
      end_date: endDate,
    })
    if (error) console.error(error)
    else {
      setName('')
      setStartDate('')
      setEndDate('')
      load()
    }
  }

  if (loading) return <div className="text-center mt-10">Loading sprints…</div>

  return (
    <div className="flex flex-col h-full">
      <Breadcrumbs />
      <div className="p-4 space-y-6 bg-[var(--bg)]">
        <h1 className="text-2xl font-semibold text-[var(--text)]">Sprints</h1>

        <form
          onSubmit={handleCreate}
          className="flex flex-wrap gap-4 items-end bg-[var(--card)] border border-[var(--border)] p-4 rounded-lg"
        >
          <div className="flex-1 min-w-[200px]">
            <label className="block mb-1 text-[var(--text)]">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sprint Name"
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring focus:ring-[var(--accent-hover)]"
            />
          </div>
          <div>
            <label className="block mb-1 text-[var(--text)]">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring focus:ring-[var(--accent-hover)]"
            />
          </div>
          <div>
            <label className="block mb-1 text-[var(--text)]">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring focus:ring-[var(--accent-hover)]"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-[var(--accent)] text-black hover:bg-[var(--accent-hover)] transition"
          >
            Create Sprint
          </button>
        </form>

        <ul className="space-y-4">
          {sprints.map((s) => (
            <li
              key={s.id}
              className="flex justify-between items-center bg-[var(--card)] border border-[var(--border)] p-4 rounded-lg"
            >
              <div>
                <h2 className="text-lg font-semibold text-[var(--text)]">
                  {s.name}
                </h2>
                <p className="text-sm text-[var(--subtext)]">
                  {new Date(s.start_date).toLocaleDateString()} —{' '}
                  {new Date(s.end_date).toLocaleDateString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
