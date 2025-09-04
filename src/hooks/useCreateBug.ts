// src/hooks/useCreateBug.ts
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

type BugInsert = Record<string, any>

export function useCreateBug() {
  const qc = useQueryClient()

  return useMutation(
    async (newBug: BugInsert) => {
      // Try rich insert
      try {
        const { data, error } = await supabase.from('bugs').insert([newBug]).select().single()
        if (error) throw error
        return data
      } catch (e) {
        // Fallback minimal insert
        const minimal = { title: newBug.title, description: newBug.description ?? '', status: 'new' }
        const { data, error } = await supabase.from('bugs').insert([minimal]).select().single()
        if (error) throw error
        return data
      }
    },
    { onSuccess: () => qc.invalidateQueries({ queryKey: ['bugs'] }) }
  )
}
