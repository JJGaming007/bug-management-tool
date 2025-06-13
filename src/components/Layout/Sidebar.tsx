'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Sidebar() {
  const path = usePathname()

  return (
    <aside className="w-60 h-screen bg-[var(--card)] dark:bg-gray-900 p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-8">BugTracker</h2>
      <nav className="flex flex-col space-y-2">
        <Link
          href="/dashboard"
          className={
            path === '/dashboard'
              ? 'px-4 py-2 rounded bg-blue-500 text-white'
              : 'px-4 py-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }
        >
          Dashboard
        </Link>
        <Link
          href="/bugs"
          className={
            path === '/bugs'
              ? 'px-4 py-2 rounded bg-blue-500 text-white'
              : 'px-4 py-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }
        >
          Bugs
        </Link>
        <Link
          href="/reports"
          className={
            path === '/reports'
              ? 'px-4 py-2 rounded bg-blue-500 text-white'
              : 'px-4 py-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }
        >
          Reports
        </Link>
      </nav>
    </aside>
  )
}
