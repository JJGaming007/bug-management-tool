'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

export function Sidebar() {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  const nav = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Bugs',      href: '/bugs'      },
    { label: 'Reports',   href: '/reports'   },
  ]

  return (
    <>
      {/* Mobile toggle */}
      <div className="md:hidden fixed top-4 left-4 z-30">
        <button onClick={() => setOpen(true)}>
          <Menu className="w-6 h-6 text-gray-800 dark:text-gray-100" />
        </button>
      </div>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-20"
          onClick={() => setOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside className={`
        hidden md:block h-screen w-60 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-6
        md:sticky md:top-0 z-30
        ${open ? 'block fixed top-0 left-0' : ''}
      `}>
        <div className="flex justify-end md:hidden mb-4">
          <button onClick={() => setOpen(false)}>
            <X className="w-6 h-6 text-gray-800 dark:text-gray-100" />
          </button>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-8">
          BugTracker
        </h2>
        <nav className="space-y-4">
          {nav.map((item) => {
            const active = path === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  block px-4 py-2 rounded transition
                  ${active
                    ? 'bg-primary-100 text-primary-700 dark:bg-gray-800 dark:text-white font-semibold'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-gray-800'}
                `}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
      {/* Mobile drawer */}
      <aside className={`
        md:hidden fixed top-0 left-0 h-screen w-60 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-6 z-40
        transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex justify-end mb-4">
          <button onClick={() => setOpen(false)}>
            <X className="w-6 h-6 text-gray-800 dark:text-gray-100" />
          </button>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-8">
          BugTracker
        </h2>
        <nav className="space-y-4">
          {nav.map((item) => {
            const active = path === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  block px-4 py-2 rounded transition
                  ${active
                    ? 'bg-primary-100 text-primary-700 dark:bg-gray-800 dark:text-white font-semibold'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-gray-800'}
                `}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
