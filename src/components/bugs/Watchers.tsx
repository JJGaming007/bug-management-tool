'use client'
import { FC, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/context/AuthContext'
import type { Watcher } from '@/types'

interface WatchersProps {
  bugId: number
}

export const Watchers: FC<WatchersProps> = ({ bugId }) => {
  const { user } = useAuth()
  const [watchers, setWatchers] = useState<Watcher[]>([])

  const loadWatchers = async () => {
    const { data, error } = await supabase.from('watchers').select('*').eq('bug_id', bugId)
    if (!error && data) setWatchers(data)
  }

  useEffect(() => {
    loadWatchers()
  }, [bugId])

  const toggleWatch = async () => {
    if (!user) return
    const exists = watchers.some((w) => w.user_email === user.email)
    if (exists) {
      await supabase.from('watchers').delete().match({ bug_id: bugId, user_email: user.email })
    } else {
      await supabase.from('watchers').insert({ bug_id: bugId, user_email: user.email })
    }
    loadWatchers()
  }

  return (
    <div className="space-y-2">
      <button
        onClick={toggleWatch}
        className="px-4 py-2 bg-[var(--accent)] text-black rounded-lg hover:bg-[var(--accent-hover)]"
      >
        {watchers.some((w) => w.user_email === user?.email) ? 'Unwatch' : 'Watch'}
      </button>
      <p className="text-sm text-[var(--subtext)]">
        {watchers.length} watcher{watchers.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
