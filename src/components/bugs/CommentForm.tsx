'use client'
import { FC, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/context/AuthContext'

interface CommentFormProps {
  bugId: number
}

export const CommentForm: FC<CommentFormProps> = ({ bugId }) => {
  const [content, setContent] = useState('')
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content || !user) return
    await supabase.from('comments').insert({ bug_id: bugId, author: user.email, content })
    setContent('')
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a comment..."
        className="w-full p-2 border rounded-lg mb-2"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Submit
      </button>
    </form>
  )
}
