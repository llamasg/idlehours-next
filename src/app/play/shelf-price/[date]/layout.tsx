import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shelf Price — Guess the Launch Price | Idle Hours',
  description:
    'Can you guess the original retail price of a classic video game? A free daily puzzle for gamers.',
  openGraph: {
    title: 'Shelf Price — Idle Hours',
    description: 'One game. One price. How close can you get?',
    url: 'https://idlehours.co.uk/play/shelf-price',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
