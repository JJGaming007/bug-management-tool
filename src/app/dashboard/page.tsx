'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Stats } from '@/components/dashboard/Stats'
import { BugChart } from '@/components/dashboard/BugChart'
import { RecentBugs } from '@/components/dashboard/RecentBugs'
import { ExportCSV } from '@/components/dashboard/ExportCSV' // if you added this
import type { Bug } from '@/types'

export default function DashboardPage() {
  const [bugs, setBugs] = useState<Bug[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBugs = async () => {
      const { data, error } = await supabase.from('bugs').select('*')
      if (error) console.error('Error loading bugs:', error)
      else setBugs(data || [])
      setLoading(false)
    }
    fetchBugs()
  }, [])

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {bugs.length > 0 && <ExportCSV bugs={bugs} />}
      </div>

      <Stats bugs={bugs} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Bug Trends</h2>
          <BugChart bugs={bugs} />
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recent Bugs</h2>
          <RecentBugs
            bugs={bugs}
            onSelect={() => {
              /* optional */
            }}
          />
        </div>
      </div>
    </div>
  )
}
