'use client'

import { ThemeProvider } from 'next-themes'
import ClickSpark from './ClickSpark'

import { GameLightboxProvider } from '@/context/GameLightboxContext'
import GameLightbox from '@/components/GameLightbox'

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <GameLightboxProvider>
        <ClickSpark
          sparkColor="#c95d0d"
          sparkSize={10}
          sparkRadius={15}
          sparkCount={8}
          duration={400}
        >
          {children}
          <GameLightbox />
        </ClickSpark>
      </GameLightboxProvider>
    </ThemeProvider>
  )
}
