import './globals.css'
import Providers from './providers'
import { Sidebar } from '@/components/Layout/Sidebar'

export const metadata = {
  title: 'Bug Tracker Pro',
  description: 'Track and manage bugs with ease',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 antialiased">
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 p-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
