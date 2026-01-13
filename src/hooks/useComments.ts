import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { Comment } from '@/types'

export function useComments(bugId: string | number) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchComments = useCallback(async () => {
    if (!isSupabaseConfigured || !bugId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Use bug_comments table (correct table name)
      const { data, error: fetchError } = await supabase
        .from('bug_comments')
        .select('*')
        .eq('bug_id', bugId)
        .order('created_at', { ascending: true })

      if (fetchError) {
        console.error('Error fetching comments:', fetchError)
        setError(fetchError.message)
        setComments([])
      } else {
        setComments((data as Comment[]) || [])
      }
    } catch (e) {
      console.error('Failed to fetch comments:', e)
      setError(e instanceof Error ? e.message : 'Failed to fetch comments')
      setComments([])
    } finally {
      setLoading(false)
    }
  }, [bugId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const addComment = useCallback(
    async (content: string, authorId: string) => {
      if (!isSupabaseConfigured || !bugId) {
        return { error: 'Not configured' }
      }

      try {
        const { data, error: insertError } = await supabase
          .from('bug_comments')
          .insert([{ bug_id: bugId, author_id: authorId, content }])
          .select()
          .single()

        if (insertError) {
          console.error('Error adding comment:', insertError)
          return { error: insertError.message }
        }

        // Refresh comments
        await fetchComments()
        return { data }
      } catch (e) {
        console.error('Failed to add comment:', e)
        return { error: e instanceof Error ? e.message : 'Failed to add comment' }
      }
    },
    [bugId, fetchComments]
  )

  const deleteComment = useCallback(
    async (commentId: string | number) => {
      if (!isSupabaseConfigured) {
        return { error: 'Not configured' }
      }

      try {
        const { error: deleteError } = await supabase
          .from('bug_comments')
          .delete()
          .eq('id', commentId)

        if (deleteError) {
          console.error('Error deleting comment:', deleteError)
          return { error: deleteError.message }
        }

        // Refresh comments
        await fetchComments()
        return { success: true }
      } catch (e) {
        console.error('Failed to delete comment:', e)
        return { error: e instanceof Error ? e.message : 'Failed to delete comment' }
      }
    },
    [fetchComments]
  )

  return {
    comments,
    loading,
    error,
    refetch: fetchComments,
    addComment,
    deleteComment,
  }
}
