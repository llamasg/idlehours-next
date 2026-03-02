'use client'

import ClickSpark from './ClickSpark'
import CdPlayer from './CdPlayer'
import { GameLightboxProvider } from '@/context/GameLightboxContext'
// TODO: Task 4 will create GameLightbox component
// import GameLightbox from '@/components/GameLightbox'

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <GameLightboxProvider>
      <ClickSpark
        sparkColor="#c95d0d"
        sparkSize={10}
        sparkRadius={15}
        sparkCount={8}
        duration={400}
      >
        <CdPlayer />
        {children}
        {/* TODO: Task 4 will create GameLightbox component */}
        {/* <GameLightbox /> */}
      </ClickSpark>
    </GameLightboxProvider>
  )
}
