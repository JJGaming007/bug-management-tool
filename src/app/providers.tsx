// src/app/providers.tsx
'use client'

import React from 'react'
import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

import { AuthProvider }      from '@/lib/context/AuthContext'
import { ThemeProvider }     from '@/lib/context/ThemeContext'
import { ReactQueryProvider } from '@/components/ReactQueryProvider'
import { Sidebar }           from '@/components/ui/Sidebar'
import { TopBar }            from '@/components/ui/TopBar'
import  RequireAuth        from '@/components/ui/RequireAuth'

interface ProvidersProps {
  children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  const pathname   = usePathname()
  const isAuthRoute = ['/login','/signup'].includes(pathname)

  return (
    <AuthProvider>
      <ThemeProvider>
        <ReactQueryProvider>
          <div className="flex h-screen bg-[var(--bg)]">
            {/* only show Sidebar/TopBar once, on protected routes */}
            {!isAuthRoute && <Sidebar />}

            <div className="flex-1 flex flex-col">
              {!isAuthRoute && <TopBar />}

              <main
                className={
                  isAuthRoute
                    ? 'flex-1 flex items-center justify-center'
                    : 'flex-1 overflow-auto p-4'
                }
              >
                {isAuthRoute
                  ? children
                  : <RequireAuth>{children}</RequireAuth>
                }
              </main>
            </div>
          </div>
        </ReactQueryProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}