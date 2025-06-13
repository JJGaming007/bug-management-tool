// src/components/dashboard/BugChart.tsx
'use client'

import { FC } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

interface BugChartProps {
  data: number[]
}

export const BugChart: FC<BugChartProps> = ({ data }) => {
  // Build an array of { date, count } for the last N days
  const chartData = data.map((count, idx) => {
    const day = new Date()
    day.setDate(day.getDate() - (data.length - 1 - idx))
    return {
      date: day.toLocaleDateString(),
      count,
    }
  })

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis dataKey="date" stroke="var(--text)" tick={{ fontSize: 12 }} />
        <YAxis stroke="var(--text)" />
        <Tooltip
          contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
          itemStyle={{ color: 'var(--text)' }}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="var(--accent)"
          strokeWidth={2}
          dot={{ fill: 'var(--accent)' }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
