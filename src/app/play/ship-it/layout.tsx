import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ship It — An Indie Dev Story | Idle Hours',
  description:
    'Navigate publisher meetings. Keep your vision intact. Launch your indie game.',
  openGraph: {
    title: 'Ship It — An Indie Dev Story',
    description:
      'Navigate publisher meetings. Keep your vision intact. Launch your indie game.',
    type: 'website',
  },
}

export default function ShipItLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
