'use client'

import React, { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { useBugs } from '@/hooks/useBugs'

const COLORS = ['#8884d8','#82ca9d','#ffc658','#ff8042','#00C49F','#FFBB28','#FF4444']
const normalize = (s?: string)=> s? s.toLowerCase().replace(/\s+/g,'_'): ''

export function BugChart({ type }: { type:'status'|'priority' }) {
  const { data: bugs = [], isLoading, error } = useBugs()

  const data = useMemo(() => {
    const counts:Record<string,number> = {}
    bugs.forEach(b=>{
      const key = type==='status' ? normalize(b.status) : normalize(b.priority)
      if(key) counts[key]=(counts[key]||0)+1
    })
    return Object.entries(counts).map(([n,c])=>({ name: n.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase()), count:c }))
  }, [bugs, type])

  if (isLoading) return <p className="text-gray-500">Loading chart…</p>
  if (error)     return <p className="text-red-500">Error</p>
  if (bugs.length===0)  return <p className="text-gray-500">No data</p>
  if (!data.length)     return <p className="text-yellow-500">No {type} data</p>

  return type==='status' ? (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3"/>
        <XAxis dataKey="name"/>
        <YAxis allowDecimals={false}/>
        <Tooltip/>
        <Bar dataKey="count" fill={COLORS[0]}/>
      </BarChart>
    </ResponsiveContainer>
  ) : (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="name" outerRadius={80} label>
          {data.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
        </Pie>
        <Tooltip/>
        <Legend/>
      </PieChart>
    </ResponsiveContainer>
  )
}
