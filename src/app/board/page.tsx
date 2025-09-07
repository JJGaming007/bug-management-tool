'use client'

import KanbanBoard from '@/components/bugs/KanbanBoard'
import { useBugs } from '@/hooks/useBugs'

export default function BoardPage() {
  const { data: bugs = [], isLoading, error, refetch } = useBugs()

  return (
    <div className="container" style={{ padding: 24 }}>
      <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Board</h1>
      <div className="card" style={{ padding: 16, marginTop: 16 }}>
        {isLoading && <div className="skeleton" style={{ height: 240 }} />}
        {error && (
          <div
            style={{
              color: '#fecaca',
              background: 'rgba(239,68,68,.1)',
              border: '1px solid rgba(239,68,68,.4)',
              padding: 12,
              borderRadius: 12,
            }}
          >
            Failed to load bugs
          </div>
        )}
        {!isLoading && !error && (
          <KanbanBoard
            bugs={bugs}
            onStatusChange={async (id, status) => {
              // TODO: Call API or supabase to update bug status
              console.log(`Move bug ${id} → ${status}`)
              refetch()
            }}
          />
        )}
      </div>
    </div>
  )
}
