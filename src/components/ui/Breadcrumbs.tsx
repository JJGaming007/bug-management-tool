'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nameMap: Record<string, string> = {
  dashboards: 'Dashboard',
  dashboard: 'Dashboard',
  bugs: 'Bugs',
  board: 'Board',
  sprints: 'Sprints',
  backlog: 'Backlog',
}

export function Breadcrumbs() {
  const pathname = usePathname() || ''
  const segments = pathname.split('/').filter(Boolean)

  // Build incremental paths
  let href = ''
  return (
    <nav aria-label="Breadcrumb" className="text-sm mb-4">
      <ol className="inline-flex items-center space-x-1">
        <li>
          <Link href="/" className="hover:text-[var(--accent)]">
            Home
          </Link>
        </li>
        {segments.map((seg, idx) => {
          href += `/${seg}`

          // For numeric IDs, show “#<id>”
          const isId = /^[0-9a-fA-F-]{6,}$/.test(seg)
          const label = isId ? `#${seg}` : nameMap[seg] || seg.replace(/-/g, ' ')

          return (
            <li key={href} className="flex items-center">
              <span className="mx-2 text-[var(--subtext)]">/</span>
              {idx < segments.length - 1 ? (
                <Link href={href} className="hover:text-[var(--accent)]">
                  {label}
                </Link>
              ) : (
                <span className="font-medium">{label}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
