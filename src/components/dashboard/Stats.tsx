'use client'
import { FC } from 'react'
import type { Bug } from '@/types'

interface StatsProps {
  bugs: Bug[]
}

export const Stats: FC<StatsProps> = ({ bugs }) => {
  const total = bugs.length
  const open = bugs.filter((b) => b.status === 'open').length
  const inProgress = bugs.filter((b) => b.status === 'in-progress').length
  const closed = bugs.filter((b) => b.status === 'closed').length

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
      <div className="card text-center">
        <h3 className="text-lg font-semibold mb-2">Total</h3>
        <p className="text-3xl font-bold">{total}</p>
      </div>
      <div className="card text-center">
        <h3 className="text-lg font-semibold mb-2 text-red-600 dark:text-red-400">Open</h3>
        <p className="text-3xl font-bold">{open}</p>
      </div>
      <div className="card text-center">
        <h3 className="text-lg font-semibold mb-2 text-yellow-600 dark:text-yellow-400">
          In Progress
        </h3>
        <p className="text-3xl font-bold">{inProgress}</p>
      </div>
      <div className="card text-center">
        <h3 className="text-lg font-semibold mb-2 text-green-600 dark:text-green-400">Closed</h3>
        <p className="text-3xl font-bold">{closed}</p>
      </div>
    </div>
  )
}
