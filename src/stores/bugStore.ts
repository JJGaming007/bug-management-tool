import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import type { Bug } from '@/types'

interface BugStore {
  bugs: Bug[]
  loading: boolean
  fetchBugs: () => Promise<void>
  selectedBug: Bug | null
  setSelectedBug: (b: Bug | null) => void
}

export const useBugStore = create<BugStore>((set) => ({
  bugs: [],
  loading: false,
  selectedBug: null,
  setSelectedBug: (b) => set({ selectedBug: b }),
  fetchBugs: async () => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('bugs')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      console.error(error)
      set({ bugs: [] })
    } else {
      set({ bugs: data ?? [] })
    }
    set({ loading: false })
  },
}))
