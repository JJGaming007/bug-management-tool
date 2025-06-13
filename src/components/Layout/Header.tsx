// src/components/Layout/Header.tsx
'use client'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/lib/context/ThemeContext'
import { Button } from '@/components/ui/Button'
import { Sun, Moon } from 'lucide-react'

export function Header() {
  const { user, signOut } = useAuth()
  const { theme, toggle } = useTheme()

  return (
    <header className="flex justify-between items-center mb-6">
      <div className="flex items-center space-x-4">
        <span className="text-gray-600 dark:text-gray-300">{user?.email}</span>
        <Button variant="secondary" size="sm" onClick={() => signOut()}>
          Logout
        </Button>
      </div>
      <button
        onClick={toggle}
        className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        aria-label="Toggle dark mode"
      >
        {theme === 'light' ? (
          <Moon className="w-5 h-5 text-gray-800" />
        ) : (
          <Sun className="w-5 h-5 text-yellow-300" />
        )}
      </button>
    </header>
  )
}
