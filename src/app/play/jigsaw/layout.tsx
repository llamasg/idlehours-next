import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Jigsaw | Idle Hours',
  description: 'A slow jigsaw puzzle. No timer. No pressure.',
}

export default function JigsawLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
