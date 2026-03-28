import type { ReactNode } from 'react'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Jobs — Idle Hours', robots: 'noindex, nofollow' }

export default function JobsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="game-container min-h-screen bg-[hsl(var(--game-cream))]">
      {children}
    </div>
  )
}
