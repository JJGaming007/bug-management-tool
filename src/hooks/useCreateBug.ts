// src/hooks/useCreateBug.ts
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'
import { useAuth } from '@/lib/context/AuthContext'

export function useCreateBug() {
  const qc = useQueryClient()
  const auth = (() => { try { return useAuth() } catch { return { user: null } } })()
  const user = auth?.user ?? null

  return useMutation({
    mutationFn: async (newBug: Record<string, unknown>) => {
      // defensive normalize
      const payload: Record<string, unknown> = { ...newBug }
      if (!payload.status) payload.status = 'Open'
      if (String(payload.status).toLowerCase() === 'new') payload.status = 'Open'
      if (!payload.bug_key) payload.bug_key = uuidv4()
      if (!payload.reporter_id) payload.reporter_id = user?.id ?? null

      console.log('[useCreateBug] payload:', payload)
      const res = await supabase.from('bugs').insert(payload).select().single()
      if (res.error) throw res.error
      return res.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bugs'] })
  })
}
