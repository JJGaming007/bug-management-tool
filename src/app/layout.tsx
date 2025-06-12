// src/app/layout.tsx
import './globals.css'
import { ReactNode } from 'react'
import { AuthProvider } from '@/lib/context/AuthContext'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import { TopBar } from '@/components/ui/TopBar'
import { ReactQueryProvider } from '@/components/ReactQueryProvider'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className="flex h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
        <AuthProvider>
          <ReactQueryProvider>
            {/* Sidebar */}
            <aside className="hidden md:flex md:flex-col w-56 bg-[var(--card)] border-r border-[var(--border)] p-6">
              <div className="text-2xl font-bold mb-8">BugTracker</div>
              <nav className="flex-1 space-y-4 text-lg">
                <Link href="/dashboard" className="block hover:text-[var(--accent)]">
                  Dashboard
                </Link>
                <Link href="/bugs" className="block hover:text-[var(--accent)]">
                  Bugs
                </Link>
                <Link href="/board" className="block hover:text-[var(--accent)]">
                  Board
                </Link>
                <Link href="/sprints" className="block hover:text-[var(--accent)]">
                  Sprints
                </Link>
                <Link href="/backlog" className="block hover:text-[var(--accent)]">
                  Backlog
                </Link>
              </nav>
              <div className="mt-auto pt-6">
                <ThemeToggle />
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-auto">
              <TopBar />
              <main className="flex-1 container mx-auto p-6">{children}</main>
            </div>
          </ReactQueryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
