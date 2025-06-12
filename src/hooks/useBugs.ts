import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { definitions as DB } from '@/types/database'

// Use the exact `bugs` table definition
type Bug = DB['bugs']

export function useBugs() {
  return useQuery<Bug[], Error>({
    queryKey: ['bugs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from<Bug>('bugs')
        .select('*')
      if (error) throw error
      return data!
    },
  })
}
