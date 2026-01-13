'use client'

import { useState, useCallback } from 'react'
import KanbanBoard from '@/components/bugs/KanbanBoard'
import { useBugs } from '@/hooks/useBugs'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function BoardPage() {
  const { data: bugs = [], isLoading, error, refetch } = useBugs()
  const [updating, setUpdating] = useState<string | number | null>(null)

  const handleStatusChange = useCallback(
    async (id: string | number, newStatus: string) => {
      if (!isSupabaseConfigured) {
        toast.error('Database not configured')
        return
      }
      setUpdating(id)
      try {
        // Map status key to database format
        const statusMap: Record<string, string> = {
          open: 'Open',
          in_progress: 'In Progress',
          resolved: 'Resolved',
          closed: 'Closed',
        }

        const dbStatus = statusMap[newStatus] || newStatus

        const { error: updateError } = await supabase
          .from('bugs')
          .update({ status: dbStatus })
          .eq('id', id)

        if (updateError) {
          throw updateError
        }

        // Log the activity
        await supabase.from('bug_activities').insert({
          bug_id: id,
          action: 'status_changed',
          field_name: 'status',
          new_value: dbStatus,
        })

        toast.success(`Bug moved to ${dbStatus}`)
        refetch()
      } catch (err) {
        console.error('Failed to update bug status:', err)
        toast.error('Failed to update status')
      } finally {
        setUpdating(null)
      }
    },
    [refetch]
  )

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Board</h1>
        <p className="page-subtitle">Drag and drop bugs between columns to update their status</p>
      </div>

      {isLoading ? (
        <div className="card">
          <div className="card-body">
            <div style={{ display: 'flex', gap: '16px' }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton" style={{ width: '320px', height: '400px', borderRadius: 'var(--radius-lg)' }} />
              ))}
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="card">
          <div className="card-body">
            <div className="alert alert-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              <span>Failed to load bugs. Please try again.</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          {updating && (
            <div style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              background: 'var(--bg-elevated)',
              padding: '12px 20px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              zIndex: 100,
              boxShadow: 'var(--shadow-lg)',
            }}>
              <div className="spinner" />
              <span style={{ fontSize: '13px' }}>Updating...</span>
            </div>
          )}
          <KanbanBoard
            bugs={bugs}
            onStatusChange={handleStatusChange}
          />
        </>
      )}
    </div>
  )
}
