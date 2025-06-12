'use client'
import { FC, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Activity } from '@/types'

interface TimelineProps {
  bugId: number
}

export const Timeline: FC<TimelineProps> = ({ bugId }) => {
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    const loadActivities = async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('bug_id', bugId)
        .order('created_at', { ascending: true })
      if (!error && data) {
        setActivities(data)
      }
    }
    loadActivities()
  }, [bugId])

  return (
    <div className="mt-4">
      <h3 className="text-xl font-semibold mb-2">Activity Timeline</h3>
      <ul className="space-y-2 text-sm">
        {activities.map((a) => (
          <li key={a.id}>
            <strong>{a.actor}</strong> {a.action}{' '}
            <span className="text-gray-500">{new Date(a.created_at).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
