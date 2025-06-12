'use client'
import { FC } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import type { Bug } from '@/types'

interface BugChartProps {
  bugs: Bug[]
}

export const BugChart: FC<BugChartProps> = ({ bugs }) => {
  const counts = bugs.reduce<Record<string, number>>((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1
    return acc
  }, {})
  const data = Object.entries(counts).map(([status, count]) => ({
    status,
    count,
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <XAxis dataKey="status" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" />
      </BarChart>
    </ResponsiveContainer>
  )
}
