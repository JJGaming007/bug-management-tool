'use client'

import { FC, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface StatusSelectorProps {
  bugId: string | number
  currentStatus: string
}

export const StatusSelector: FC<StatusSelectorProps> = ({ bugId, currentStatus }) => {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    setLoading(true)
    const { error } = await supabase
      .from('bugs')
      .update({ status: newStatus })
      .eq('id', bugId)
    setLoading(false)

    if (error) {
      console.error(error)
      toast.error('Failed to update status')
    } else {
      setStatus(newStatus)
      toast.success('Status updated')
    }
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={loading}
      className="px-2 py-1 border rounded-lg"
    >
      <option value="open">Open</option>
      <option value="in-progress">In Progress</option>
      <option value="closed">Closed</option>
    </select>
  )
}
