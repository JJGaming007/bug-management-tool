// app/layout.tsx
import './globals.css'
import Providers from './providers'

export const metadata = {
  title: 'BugTracker',
  description: 'A simple bug-management tool',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Providers will do Auth, Theme, QueryClient, Sidebar, TopBar, RequireAuth */}
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
