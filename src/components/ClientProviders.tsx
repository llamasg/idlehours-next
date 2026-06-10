'use client'

import { ThemeProvider } from 'next-themes'

import { GameLightboxProvider } from '@/context/GameLightboxContext'
import GameLightbox from '@/components/GameLightbox'

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <GameLightboxProvider>
        {children}
        <GameLightbox />
      </GameLightboxProvider>
    </ThemeProvider>
  )
}
