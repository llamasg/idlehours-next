import type { ReactNode } from 'react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Stock Room — Daily Game Grid Puzzle | Idle Hours',
  description: 'Nine cells, two criteria each. Name any game that fits both. A free daily puzzle for gamers.',
  openGraph: {
    title: 'Stock Room — Idle Hours',
    description: 'Fill the 3×3 grid. Any game counts — if it fits.',
    url: 'https://idlehours.co.uk/play/stock-room',
  },
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
