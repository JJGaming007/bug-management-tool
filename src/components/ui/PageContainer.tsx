// src/components/ui/PageContainer.tsx
'use client'

import { FC, ReactNode } from 'react'

interface PageContainerProps {
  title?: string
  breadcrumbs?: ReactNode
  children: ReactNode
}

export const PageContainer: FC<PageContainerProps> = ({ title, breadcrumbs, children }) => {
  return (
    <div className="flex-1 overflow-auto bg-[var(--bg)]">
      <div className="container mx-auto px-4 py-6">
        {breadcrumbs && <div className="mb-4">{breadcrumbs}</div>}
        {title && <h1 className="text-2xl font-bold mb-6">{title}</h1>}
        {children}
      </div>
    </div>
  )
}
