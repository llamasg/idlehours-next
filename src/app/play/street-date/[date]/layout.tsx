import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Street Date — Daily Game Cover Guessing Puzzle | Idle Hours',
  description:
    'Guess the release year from five game box art covers. A free daily puzzle for gamers.',
  openGraph: {
    title: 'Street Date — Idle Hours',
    description: 'Five covers. One year. How close can you get?',
    url: 'https://idlehours.co.uk/play/street-date',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
