'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/staging', label: 'Overview', short: '◆' },
  { href: '/staging/layout-concepts', label: 'Layout', short: '01' },
  { href: '/staging/type-components', label: 'Type + Components', short: '02' },
  { href: '/staging/imagery', label: 'Imagery', short: '03' },
  { href: '/staging/components', label: 'Component Library', short: '04' },
  { href: '/staging/micro', label: 'Micro', short: '05' },
  { href: '/staging/macro', label: 'Macro', short: '06' },
  { href: '/staging/notebook', label: 'Notebook', short: '07' },
]

export default function StagingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[hsl(var(--game-cream))]">
      {/* Sticky navigation */}
      <nav className="sticky top-0 z-50 border-b border-[hsl(var(--game-ink))]/10 bg-[hsl(var(--game-cream))]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-3">
          <span className="mr-3 flex-shrink-0 font-heading text-xs font-black uppercase tracking-[0.28em] text-[hsl(var(--game-amber))]">
            Staging
          </span>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 font-heading text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[hsl(var(--game-ink))] text-[hsl(var(--game-cream))]'
                    : 'text-[hsl(var(--game-ink-mid))] hover:bg-[hsl(var(--game-ink))]/5 hover:text-[hsl(var(--game-ink))]'
                }`}
              >
                <span className={`font-black ${isActive ? 'text-[hsl(var(--game-amber))]' : 'text-[hsl(var(--game-ink-light))]'}`}>
                  {item.short}
                </span>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Page content */}
      {children}
    </div>
  )
}
