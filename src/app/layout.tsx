import type { Metadata, Viewport } from 'next'
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  interactiveWidget: 'resizes-content',
  viewportFit: 'cover',
  themeColor: '#f5f0e8',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
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
