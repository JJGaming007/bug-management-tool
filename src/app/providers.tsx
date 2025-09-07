// src/app/providers.tsx
'use client'

import React from 'react'
import { AuthProvider } from '@/lib/context/AuthContext'

// Robust import resolution helper for TopBar and Sidebar
import * as TopBarModule from '@/components/ui/TopBar'
import * as SidebarModule from '@/components/ui/Sidebar'

// React Query fallback provider
import { QueryClient, QueryClientProvider as TanstackQueryProvider } from '@tanstack/react-query'

/** Resolve component from module that may export default or named */
function resolveComponent<T = React.ComponentType<any>>(mod: any, names = ['default']) {
  if (!mod) return undefined
  if (typeof mod === 'function' || (mod && (mod.$$typeof || mod.prototype))) return mod as T
  for (const n of names) {
    if (mod[n]) return mod[n] as T
  }
  return undefined
}

const TopBar = resolveComponent(TopBarModule, ['default', 'TopBar'])
const Sidebar = resolveComponent(SidebarModule, ['default', 'Sidebar'])

/** Fallback Query Client provider (using @tanstack/react-query) */
function FallbackQueryClientProvider({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 2, // 2 minutes
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }))
  return <TanstackQueryProvider client={client}>{children}</TanstackQueryProvider>
}

/** Small fallbacks so missing TopBar/Sidebar don't crash the app while you fix exports */
function FallbackTopBar() {
  React.useEffect(() => {
    console.warn('[Providers] TopBar component missing or exported incorrectly. Check src/components/ui/TopBar.tsx')
  }, [])
  return (
    <div style={{ padding: 12, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
      <div style={{ fontWeight: 600 }}>BugTracker</div>
    </div>
  )
}

function FallbackSidebar() {
  React.useEffect(() => {
    console.warn('[Providers] Sidebar component missing or exported incorrectly. Check src/components/ui/Sidebar.tsx')
  }, [])
  return (
    <div style={{ padding: 12 }}>
      <nav>
        <div style={{ marginBottom: 8 }}>Dashboard</div>
        <div style={{ marginBottom: 8 }}>Bugs</div>
      </nav>
    </div>
  )
}

/**
 * Providers wrapper:
 * - Mounts a QueryClientProvider (fallback)
 * - Mounts AuthProvider (so useAuth() works)
 * - Renders the app shell with robust resolution of TopBar/Sidebar and safe fallbacks
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  const TopBarComp = TopBar ?? FallbackTopBar
  const SidebarComp = Sidebar ?? FallbackSidebar

  return (
    <FallbackQueryClientProvider>
      <AuthProvider>
        <div className="app-shell min-h-screen flex bg-slate-900 text-slate-100">
          <aside className="sidebar shrink-0 w-56 border-r border-slate-800 bg-slate-950/30">
            <SidebarComp />
          </aside>

          <div className="main flex-1 min-w-0">
            <header className="topbar">
              <TopBarComp />
            </header>

            <main className="p-6 min-h-[calc(100vh-64px)]">
              {children}
            </main>
          </div>
        </div>
      </AuthProvider>
    </FallbackQueryClientProvider>
  )
}
