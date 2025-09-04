'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Bug } from '@/types'
import { KanbanBoard } from '@/components/bugs/KanbanBoard'
import  RequireAuth  from '@/components/ui/RequireAuth'

export default function BoardPage() {
  return (
    <div className="container" style={{ padding: 24 }}>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Board</h1>
      <div className="card" style={{ padding: 16, marginTop: 16 }}>
        <KanbanBoard />
      </div>
    </div>
  )
}

function InnerBoardPage() {
  const [bugs, setBugs] = useState<Bug[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('bugs')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setBugs(data)
        setLoading(false)
      })
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
