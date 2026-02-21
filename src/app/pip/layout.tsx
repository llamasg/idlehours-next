import type { ReactNode } from 'react'
import PipAuthGate from '@/pip/auth/PipAuthGate'
import PipLayout from '@/pip/PipLayout'

export default function PipRootLayout({ children }: { children: ReactNode }) {
  return (
    <PipAuthGate>
      <PipLayout>
        {children}
      </PipLayout>
    </PipAuthGate>
  )
}
