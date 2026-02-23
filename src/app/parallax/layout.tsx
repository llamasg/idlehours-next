import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Parallax',
}

export default function ParallaxLayout({ children }: { children: React.ReactNode }) {
  return children
}
