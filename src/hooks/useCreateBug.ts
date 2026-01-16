// src/hooks/useCreateBug.ts
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'
import { useAuth } from '@/lib/context/AuthContext'

// Ensure user profile exists in the profiles table
async function ensureProfileExists(userId: string, userEmail?: string | null): Promise<boolean> {
  try {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (existingProfile) {
      return true
    }

    // Profile doesn't exist, create it
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: userEmail || '',
        full_name: userEmail ? userEmail.split('@')[0] : 'User',
      })

    if (insertError) {
      console.error('Failed to create profile:', insertError)
      // If it's a duplicate key error, the profile exists (race condition)
      if (insertError.code === '23505') {
        return true
      }
      return false
    }

    return true
  } catch (err) {
    console.error('Error ensuring profile exists:', err)
    return false
  }
}

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

      // Ensure profile exists before creating bug (fixes foreign key constraint)
      if (payload.reporter_id) {
        await ensureProfileExists(payload.reporter_id as string, user?.email)
      }

      console.log('[useCreateBug] payload:', payload)
      const res = await supabase.from('bugs').insert(payload).select().single()
      if (res.error) throw res.error
      return res.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bugs'] })
  })
}
