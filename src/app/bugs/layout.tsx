// src/app/bugs/layout.tsx
import React from 'react'

export const metadata = {
  title: 'All Bugs',
  description: 'Manage your project bugs',
}

export default function BugsLayout({ children }: { children: React.ReactNode }) {
  // This layout wraps both /bugs and /bugs/[bugId]
  return <div className="space-y-6">{children}</div>
}
