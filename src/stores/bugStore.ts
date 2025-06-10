import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

interface Bug {
  id: string;
  bug_key: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  priority?: string;
  component?: string;
  reporter_id: string;
  assignee_id?: string;
  created_at: string;
  updated_at?: string;
}

interface BugFilters {
  status?: string[];
  severity?: string[];
  priority?: string[];
  assignee?: string[];
  search?: string;
}

interface BugStore {
  bugs: Bug[];
  selectedBug: Bug | null;
  isCreateModalOpen: boolean;
  filters: BugFilters;
  fetchBugs: () => Promise<void>;
  setSelectedBug: (bug: Bug | null) => void;
  setCreateModalOpen: (open: boolean) => void;
  setFilters: (filters: BugFilters) => void;
  clearFilters: () => void;
}

export const useBugStore = create<BugStore>((set) => ({
  bugs: [],
  selectedBug: null,
  isCreateModalOpen: false,
  filters: {},

  fetchBugs: async () => {
    const { data, error } = await supabase
      .from('bugs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Failed to fetch bugs:', error.message);
    } else {
      set({ bugs: data || [] });
    }
  },

  setSelectedBug: (bug) => set({ selectedBug: bug }),

  setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),

  setFilters: (filters) => set({ filters }),

  clearFilters: () => set({ filters: {} }),
}));
