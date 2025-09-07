// src/app/layout.tsx
import "./globals.css"
import type { Metadata } from "next"
import Providers from "./providers"

export const metadata: Metadata = {
  title: "BugTracker",
  description: "Track bugs",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        {/* Providers must include AuthProvider and any global UI shell */}
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
