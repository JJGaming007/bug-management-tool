'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  ClipboardList,
  Calendar,
  LayoutGrid,
  Menu,
  X,
} from 'lucide-react'

export function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 bg-[var(--card)] border-r border-[var(--border)]
        transform transition-transform duration-200 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        sm:translate-x-0 sm:static sm:w-64
        z-50
      `}
    >
      {/* Mobile header */}
      <div className="flex items-center justify-between p-4 sm:hidden">
        <span className="text-lg font-bold text-[var(--text)]">Menu</span>
        <button onClick={() => setOpen(false)}>
          <X className="w-6 h-6 text-[var(--text)]" />
        </button>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 overflow-auto px-2 pb-4 space-y-1">
        <SidebarLink href="/" icon={Home} label="Dashboard" />
        <SidebarLink href="/bugs" icon={ClipboardList} label="Bugs" />
        <SidebarLink href="/board" icon={LayoutGrid} label="Board" />
        <SidebarLink href="/sprints" icon={Calendar} label="Sprints" />
      </nav>

      {/* Mobile open button */}
      <div className="p-4 sm:hidden">
        <button onClick={() => setOpen(true)} className="flex items-center">
          <Menu className="w-6 h-6 text-[var(--text)]" />
          <span className="ml-2 text-[var(--text)]">Open menu</span>
        </button>
      </div>
    </aside>
  )
}

function SidebarLink({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: React.FC<React.SVGProps<SVGSVGElement>>
  label: string
}) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`
        flex items-center px-3 py-2 rounded
        ${isActive
          ? 'bg-[var(--accent)] text-black'
          : 'text-[var(--text)] hover:bg-[var(--accent-hover)] hover:text-black'}
      `}
    >
      <Icon className="w-5 h-5 mr-3" />
      <span>{label}</span>
    </Link>
  )
}
