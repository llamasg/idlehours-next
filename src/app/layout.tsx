import type { Metadata } from 'next'
import './globals.css'
import ClientProviders from '@/components/ClientProviders'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  title: {
    default: 'Idle Hours',
    template: '%s | Idle Hours',
  },
  description: 'Cozy game discovery and reviews for the quiet hours',
  metadataBase: new URL('https://idlehours.co.uk'),
  openGraph: {
    siteName: 'Idle Hours',
    locale: 'en_GB',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
