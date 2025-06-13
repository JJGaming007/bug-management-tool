'use client'
import { FC, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { Bug } from '@/types'

interface BugChartProps {
  bugs: Bug[]
}

export const BugChart: FC<BugChartProps> = ({ bugs }) => {
  const data = useMemo(() => {
    const counts = { open: 0, 'in-progress': 0, resolved: 0, closed: 0 }
    bugs.forEach((b) => {
      if (counts[b.status] !== undefined) counts[b.status]++
    })
    return Object.entries(counts).map(([status, value]) => ({ status, value }))
  }, [bugs])

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <XAxis dataKey="status" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" />
      </BarChart>
    </ResponsiveContainer>
  )
}
