'use client'

import './globals.css'
import { ReactNode } from 'react'
import { AuthProvider } from '@/lib/context/AuthContext'
import { ThemeProvider } from '@/lib/context/ThemeContext'
import { ReactQueryProvider } from '@/components/ReactQueryProvider'
import { Sidebar } from '@/components/ui/Sidebar'
import { TopBar } from '@/components/ui/TopBar'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
        <ThemeProvider>
          <AuthProvider>
            <ReactQueryProvider>
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-auto">
                <TopBar />
                <main className="flex-1 container mx-auto p-6">{children}</main>
              </div>
            </ReactQueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
