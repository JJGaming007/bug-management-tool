// src/hooks/useCreateBug.ts
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { definitions as DB } from '@/types/database'

type BugInsert = Omit<DB['bugs'], 'id' | 'created_at'>

export function useCreateBug() {
  const qc = useQueryClient()

  return useMutation(
    async (newBug: BugInsert) => {
      const { data, error } = await supabase
        .from('bugs')
        .insert(newBug)
        .single()
      if (error) throw error
      return data
    },
    {
      onSuccess: () => {
        // close modal is handled by component
        // then refetch the bug list
        qc.invalidateQueries(['bugs'])
      },
    }
  )
}
