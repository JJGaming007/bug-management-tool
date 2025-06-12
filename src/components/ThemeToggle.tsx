'use client'
import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  // initialize from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    setTheme(saved === 'dark' ? 'dark' : 'light')
  }, [])

  // apply class + persist
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label="Toggle Dark Mode"
      className="p-2 rounded-full hover:bg-[var(--accent-hover)]"
    >
      {theme === 'light' ? <Moon /> : <Sun />}
    </button>
  )
}
