import type { ReactNode } from 'react'
import PipAuthGate from '@/pip/auth/PipAuthGate'
import PipLayout from '@/pip/PipLayout'

// All pip routes are client-only (password-protected dashboard); skip static generation
export const dynamic = 'force-dynamic'

export default function PipRootLayout({ children }: { children: ReactNode }) {
  return (
    <PipAuthGate>
      <PipLayout>
        {children}
      </PipLayout>
    </PipAuthGate>
  )
}
