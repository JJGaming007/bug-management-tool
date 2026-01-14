'use client'

import { FC } from 'react'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface DeleteBugProps {
  bugId: string | number
  onDeleted?: () => void
}

export const DeleteBug: FC<DeleteBugProps> = ({ bugId, onDeleted }) => {
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this bug?')) return

    const { error } = await supabase
      .from('bugs')
      .delete()
      .eq('id', bugId)

    if (error) {
      console.error(error)
      toast.error('Failed to delete bug')
    } else {
      toast.success('Bug deleted')
      onDeleted?.()
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="text-sm text-red-600 hover:underline"
    >
      Delete
    </button>
  )
}
