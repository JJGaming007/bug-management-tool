// src/app/providers.tsx
'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { AuthProvider } from '@/lib/context/AuthContext'
import { ThemeProvider } from '@/lib/context/ThemeContext'
import { ReactQueryProvider } from '@/components/ReactQueryProvider'
import { Sidebar } from '@/components/ui/Sidebar'
import { TopBar } from '@/components/ui/TopBar'
import RequireAuth from '@/components/ui/RequireAuth'

// If you want a DB banner only when DB is actually DOWN, import it and render conditionally in TopBar:
// import DBHealth from '@/components/ui/DBHealth'

export default function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isAuthRoute = pathname === '/login' || pathname === '/signup'

  return (
    <AuthProvider>
      <ThemeProvider>
        <ReactQueryProvider>
          <div className="flex h-screen">
            {!isAuthRoute && <Sidebar />}
            <div className="flex-1 flex flex-col">
              {!isAuthRoute && <TopBar />}
              <main className="flex-1 overflow-auto">
                {isAuthRoute ? children : <RequireAuth>{children}</RequireAuth>}
              </main>
            </div>
          </div>
        </ReactQueryProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
