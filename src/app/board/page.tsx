'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Bug } from '@/types'
import { KanbanBoard } from '@/components/bugs/KanbanBoard'

export default function BoardPage() {
  const [bugs, setBugs] = useState<Bug[]>([])
  const [loading, setLoading] = useState(true)

  const loadBugs = async () => {
    const { data, error } = await supabase
      .from<Bug>('bugs')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setBugs(data)
    setLoading(false)
  }

  useEffect(() => {
    loadBugs()
  }, [])

  const handleStatusChange = async (id: number, status: Bug['status']) => {
    const { error } = await supabase.from('bugs').update({ status }).eq('id', id)
    if (!error) {
      setBugs((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)))
    }
  }

  if (loading) return <div>Loading board…</div>

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Board</h1>
      <KanbanBoard bugs={bugs} onStatusChange={handleStatusChange} />
    </div>
  )
}
