'use client'
import { FC } from 'react'
import { useComments } from '@/hooks/useComments'

interface CommentListProps {
  bugId: string | number
}

export const CommentList: FC<CommentListProps> = ({ bugId }) => {
  const { comments, loading } = useComments(bugId)

  if (loading) {
    return <p>Loading comments...</p>
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-2">Comments</h3>
      <ul className="space-y-2">
        {comments.map((c) => (
          <li key={c.id} className="p-2 border rounded-lg">
            <p className="text-sm text-gray-500">
              {c.author} on {new Date(c.created_at).toLocaleString()}
            </p>
            <p>{c.content}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
