import type { ReactNode } from 'react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Street Date — Daily Game Sorting Puzzle | Idle Hours',
  description: 'Place all seven games in release order. A free daily puzzle for gamers.',
  openGraph: {
    title: 'Street Date — Idle Hours',
    description: 'Seven covers. One timeline. How close can you get?',
    url: 'https://idlehours.co.uk/play/street-date',
  },
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
