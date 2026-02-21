import PipAuthGate from '@/pip/auth/PipAuthGate'
import PipLayout from '@/pip/PipLayout'

export default function PipRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <PipAuthGate>
      <PipLayout>
        {children}
      </PipLayout>
    </PipAuthGate>
  )
}
