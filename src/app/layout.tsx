// src/app/layout.tsx
'use client'
import './globals.css'
import { ReactNode } from 'react'
import { ThemeProvider } from '@/lib/context/ThemeContext'
import { AuthProvider } from '@/lib/context/AuthContext'
import { ReactQueryProvider } from '@/components/ReactQueryProvider'
import { Sidebar } from '@/components/ui/Sidebar'
import { TopBar } from '@/components/ui/TopBar'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-[var(--bg)] text-[var(--text)]">
        <ThemeProvider>
          <AuthProvider>
            <ReactQueryProvider>
              <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                  <TopBar />
                  <main className="flex-1 overflow-auto">{children}</main>
                </div>
              </div>
            </ReactQueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
