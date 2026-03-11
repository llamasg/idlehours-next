import type { Viewport } from 'next'

export const viewport: Viewport = { themeColor: '#2D6BC4', maximumScale: 1 }

export default function GameSenseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
