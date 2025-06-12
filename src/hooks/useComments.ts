import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export interface Comment {
  id: number
  bug_id: number
  author: string
  content: string
  created_at: string
}

export function useComments(bugId: number) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('bug_id', bugId)
        .order('created_at', { ascending: true })
      if (error) {
        console.error('Error fetching comments:', error)
      } else {
        setComments(data || [])
      }
      setLoading(false)
    }
    fetch()
  }, [bugId])

  return { comments, loading }
}
