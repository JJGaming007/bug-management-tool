'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { BugWithDetails } from '@/lib/types'
import toast from 'react-hot-toast'

export function useBugs() {
  const supabase = createClient()

  return useQuery<BugWithDetails[], Error>({
    queryKey: ['bugs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bugs')
        .select(`
          *,
          reporter:profiles!reporter_id(id, full_name, email),
          assignee:profiles!assignee_id(id, full_name, email)
        `)
      if (error) {
        toast.error('Failed to load bugs: ' + error.message)
        throw error
      }
      return data ?? []
    },
    staleTime: 60 * 1000,
  })
}
