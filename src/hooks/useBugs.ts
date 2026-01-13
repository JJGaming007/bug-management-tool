import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'

export interface Bug {
  id: string
  bug_key?: string
  title: string
  description?: string
  status: string
  priority: string
  severity?: string
  issue_type?: string
  steps_to_reproduce?: string
  expected_result?: string
  actual_result?: string
  environment?: string
  browser?: string
  os?: string
  device?: string
  project_id?: string
  sprint_id?: string
  epic_id?: string
  reporter_id?: string
  assignee_id?: string
  assignee?: string
  labels?: string[]
  story_points?: number
  due_date?: string
  created_at: string
  updated_at?: string
  resolved_at?: string
  closed_at?: string
}

export function useBugs() {
  return useQuery<Bug[], Error>({
    queryKey: ['bugs'],
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        console.warn('Supabase not configured - returning empty bugs list')
        return []
      }

      const { data, error } = await supabase
        .from('bugs')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching bugs:', error)
        throw new Error(error.message || 'Failed to fetch bugs')
      }

      return (data as Bug[]) || []
    },
    retry: 1,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function useBug(id: string) {
  return useQuery<Bug | null, Error>({
    queryKey: ['bug', id],
    queryFn: async () => {
      if (!isSupabaseConfigured || !id) {
        return null
      }

      const { data, error } = await supabase
        .from('bugs')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching bug:', error)
        throw new Error(error.message || 'Failed to fetch bug')
      }

      return data as Bug
    },
    enabled: Boolean(id),
  })
}

export function useCreateBug() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newBug: Partial<Bug>) => {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase not configured')
      }

      // Normalize the payload
      const payload = {
        ...newBug,
        status: newBug.status || 'Open',
        priority: newBug.priority || 'medium',
      }

      const { data, error } = await supabase
        .from('bugs')
        .insert([payload])
        .select()
        .single()

      if (error) {
        console.error('Error creating bug:', error)
        throw new Error(error.message || 'Failed to create bug')
      }

      return data as Bug
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bugs'] })
    },
  })
}

export function useUpdateBug() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Bug> }) => {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase not configured')
      }

      const { data, error } = await supabase
        .from('bugs')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating bug:', error)
        throw new Error(error.message || 'Failed to update bug')
      }

      return data as Bug
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bugs'] })
      queryClient.invalidateQueries({ queryKey: ['bug', data.id] })
    },
  })
}

export function useDeleteBug() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase not configured')
      }

      const { error } = await supabase
        .from('bugs')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting bug:', error)
        throw new Error(error.message || 'Failed to delete bug')
      }

      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bugs'] })
    },
  })
}
