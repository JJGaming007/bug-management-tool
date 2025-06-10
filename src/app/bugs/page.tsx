'use client'

import { useAuth } from '@/hooks/useAuth'
import { Header } from '@/components/layout/Header'
import { BugList } from '@/components/bugs/BugList'
import { Redirect } from '@/components/auth/Redirect'

export default function BugsPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return <Redirect to="/" />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              All Bugs
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and track all bugs in your projects
            </p>
          </div>
          
          <BugList />
        </div>
      </main>
    </div>
  )
}