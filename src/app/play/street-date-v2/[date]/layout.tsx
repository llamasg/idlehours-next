import type { ReactNode } from 'react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Street Date v2 — Idle Hours',
  description: 'Place all seven games in release order',
}

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
