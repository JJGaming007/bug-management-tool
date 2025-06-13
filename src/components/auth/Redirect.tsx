'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface RedirectProps {
  to: string
  condition?: boolean
  delay?: number
}

export function Redirect({ to, condition = true, delay = 0 }: RedirectProps) {
  const router = useRouter()

  useEffect(() => {
    if (condition) {
      const timer = setTimeout(() => {
        router.push(to)
      }, delay)

      return () => clearTimeout(timer)
    }
    return undefined
  }, [condition, to, delay, router])

  if (!condition) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--card)]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}
