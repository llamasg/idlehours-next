import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shelf Price — Higher or Lower | Idle Hours',
  description:
    'Which game cost more at launch? Get 10 in a row to become an Industry Insider. A free daily puzzle for gamers.',
  openGraph: {
    title: 'Shelf Price — Idle Hours',
    description: 'Two games. Which cost more? Get 10 in a row.',
    url: 'https://idlehours.co.uk/play/shelf-price',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
