import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { Bug } from '@/types'

export function useBugs() {
  return useQuery<Bug[], Error>({
    queryKey: ['bugs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bugs')
        .select('*')
      if (error) throw error
      return data!
    },
  })
}
