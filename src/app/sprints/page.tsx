'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Sprint } from '@/types'

export default function SprintsPage() {
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

  if (loading) return <div>Loading sprints...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Sprints</h1>
      <form onSubmit={handleCreate} className="mb-6 flex flex-wrap gap-2 items-end">
        <div>
          <label className="block mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-3 py-1 border rounded-lg"
            placeholder="Sprint Name"
          />
        </div>
        <div>
          <label className="block mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1 border rounded-lg"
          />
        </div>
        <div>
          <label className="block mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1 border rounded-lg"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-[var(--accent)] rounded-lg text-black">
          Create Sprint
        </button>
      </form>

      <ul className="space-y-4">
        {sprints.map((s) => (
          <li key={s.id} className="card flex justify-between items-center">
            <div>
              <h2 className="font-semibold">{s.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(s.start_date).toLocaleDateString()} —{' '}
                {new Date(s.end_date).toLocaleDateString()}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
