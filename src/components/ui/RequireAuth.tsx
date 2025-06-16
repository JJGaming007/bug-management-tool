'use client'

import { ReactNode, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import { useRouter, usePathname } from 'next/navigation'

interface RequireAuthProps {
  children: ReactNode
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { session } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // if user isn’t logged in, redirect to login & preserve the “from” path
    if (session === null) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`)
    }
  }, [session, pathname, router])

  // while we’re waiting or redirecting, show nothing (or a spinner)
  if (!session) return null

  return <>{children}</>
}
