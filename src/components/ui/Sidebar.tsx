'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
// Use only well-known Lucide icons. If an icon is ever missing, we fall back to <Square/>.
import {
  LayoutGrid,
  Bug,
  ListChecks,
  BookOpen,
  CalendarDays,
  User,
  Square,
  type LucideIcon,
} from 'lucide-react'

const nav: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/bugs',      label: 'Bugs',      icon: Bug },
  { href: '/board',     label: 'Board',     icon: ListChecks },
  { href: '/backlog',   label: 'Backlog',   icon: BookOpen },
  { href: '/sprints',   label: 'Sprints',   icon: CalendarDays },
  { href: '/account',   label: 'Account',   icon: User },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="hidden md:flex h-screen sticky top-0 flex-col p-4 gap-6"
      style={{ width: 260 }}
      aria-label="Sidebar"
    >
      <div className="card p-4">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--accent)' }} />
          <strong style={{ letterSpacing: 0.25 }}>BugTracker</strong>
        </div>
      </div>

      <nav className="card p-2">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href)
          // extra guard: if Icon somehow undefined, render Square
          const SafeIcon = (Icon ?? Square) as LucideIcon
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-3 rounded-lg"
              style={{
                color: active ? '#001018' : 'var(--text)',
                background: active ? 'var(--accent)' : 'transparent',
              }}
            >
              <SafeIcon size={18} />
              <span className="font-semibold">{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="card p-3 text-xs" style={{ color: 'var(--subtext)' }}>
        <div><b>Tip:</b> Use search on the Bugs page to jump fast.</div>
      </div>
    </aside>
  )
}
