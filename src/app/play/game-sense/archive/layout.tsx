import type { Viewport } from 'next'

export const viewport: Viewport = { themeColor: '#2D6BC4' }

export default function GameSenseArchiveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
