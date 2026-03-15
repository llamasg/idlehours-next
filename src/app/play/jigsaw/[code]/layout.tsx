import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Jigsaw Room | Idle Hours',
  description: 'A slow jigsaw puzzle with friends. No timer. No pressure.',
}

export default function JigsawRoomLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
