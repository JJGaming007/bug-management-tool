'use client'

import React from 'react'
import Link from 'next/link'
import { Header }         from '@/components/Layout/Header'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { BugChart }       from '@/components/dashboard/BugChart'
import { RecentBugs }     from '@/components/dashboard/RecentBugs'
import { Card }           from '@/components/ui/Card'

export default function DashboardPage() {
  return (
    <div>
      <Header />

      {/* Stats */}
      <section className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card><DashboardStats stat="total" /></Card>
        <Card><DashboardStats stat="open" /></Card>
        <Card><DashboardStats stat="resolved" /></Card>
        <Card><DashboardStats stat="critical" /></Card>
      </section>

      {/* Charts */}
      <section className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Bugs by Status</h3>
          <BugChart type="status" />
        </Card>
        <Card>
          <h3 className="text-lg font-semibold mb-4">Bugs by Priority</h3>
          <BugChart type="priority" />
        </Card>
      </section>

      {/* Recent Bugs */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Bugs</h2>
          <Link
            href="/bugs"
            className="text-primary-600 hover:underline font-medium"
          >
            View all
          </Link>
        </div>
        <Card><RecentBugs /></Card>
      </section>
    </div>
  )
}
