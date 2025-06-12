'use client'
import { FC, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

interface AssignBugProps {
  bugId: number
  currentAssignee?: string
}

export const AssignBug: FC<AssignBugProps> = ({ bugId, currentAssignee }) => {
  const [assignee, setAssignee] = useState(currentAssignee || '')
  const [users, setUsers] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadUsers = async () => {
      const { data, error } = await supabase.from('users').select('username')
      if (!error && data) setUsers(data.map((u) => u.username))
    }
    loadUsers()
  }, [])

  const handleAssign = async () => {
    setLoading(true)
    const { error } = await supabase.from('bugs').update({ assignee }).eq('id', bugId)
    if (error) console.error('Assignment error:', error)
    setLoading(false)
  }

  return (
    <div className="mb-4">
      <label className="block mb-1">Assign to:</label>
      <select
        value={assignee}
        onChange={(e) => setAssignee(e.target.value)}
        className="px-3 py-1 border rounded-lg w-full"
      >
        <option value="">Unassigned</option>
        {users.map((u) => (
          <option key={u} value={u}>
            {u}
          </option>
        ))}
      </select>
      <button
        onClick={handleAssign}
        disabled={loading}
        className="mt-2 px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        {loading ? 'Assigning...' : 'Assign'}
      </button>
    </div>
  )
}
