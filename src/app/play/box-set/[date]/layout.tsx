import type { ReactNode } from 'react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Box Set — Daily Game Grouping Puzzle | Idle Hours',
  description: 'Sixteen games, four hidden connections. A free daily puzzle for gamers.',
  openGraph: {
    title: 'Box Set — Idle Hours',
    description: 'Sixteen games. Four hidden groups. Find the links.',
    url: 'https://idlehours.co.uk/play/box-set',
  },
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
