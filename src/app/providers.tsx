'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { AuthProvider } from '@/lib/context/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Toaster } from 'react-hot-toast'
import Sidebar from '@/components/ui/Sidebar'
import TopBar from '@/components/ui/TopBar'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Auth pages that should not show the app shell
const AUTH_PAGES = ['/login', '/signup', '/forgot-password', '/reset-password']

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = AUTH_PAGES.some(page => pathname?.startsWith(page))

  return (
    <QueryClientProvider client={queryClient}>
      <DndProvider backend={HTML5Backend}>
        <AuthProvider>
          {isAuthPage ? (
            // Auth pages: no sidebar/topbar
            <>{children}</>
          ) : (
            // App pages: full shell
            <div className="app-shell">
              <Sidebar />
              <div className="main">
                <TopBar />
                <main className="page-content">
                  {children}
                </main>
              </div>
            </div>
          )}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: 'white',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: 'white',
                },
              },
            }}
          />
        </AuthProvider>
      </DndProvider>
    </QueryClientProvider>
  )
}
