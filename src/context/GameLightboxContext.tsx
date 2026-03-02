'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Game } from '@/types'
import { getAllGames } from '@/lib/queries'

interface GameLightboxContextValue {
  activeGame: Game | null
  allGames: Game[]
  openLightbox: (game: Game) => void
  closeLightbox: () => void
}

const GameLightboxContext = createContext<GameLightboxContextValue | null>(null)

export function useGameLightbox() {
  const ctx = useContext(GameLightboxContext)
  if (!ctx) throw new Error('useGameLightbox must be used within GameLightboxProvider')
  return ctx
}

export function GameLightboxProvider({ children }: { children: React.ReactNode }) {
  const [activeGame, setActiveGame] = useState<Game | null>(null)
  const [allGames, setAllGames] = useState<Game[]>([])
  const [previousPath, setPreviousPath] = useState<string | null>(null)

  // Load all games once for related-games lookups
  useEffect(() => {
    getAllGames()
      .then((data) => setAllGames(data ?? []))
      .catch(() => {})
  }, [])

  const openLightbox = useCallback((game: Game) => {
    setPreviousPath(window.location.pathname + window.location.search)
    setActiveGame(game)
    history.pushState({ lightbox: true }, '', `/games/${game.slug.current}`)
  }, [])

  const closeLightbox = useCallback(() => {
    setActiveGame(null)
    if (previousPath) {
      history.pushState(null, '', previousPath)
      setPreviousPath(null)
    }
  }, [previousPath])

  // Close lightbox on browser Back
  useEffect(() => {
    function handlePopState() {
      if (activeGame) {
        setActiveGame(null)
        setPreviousPath(null)
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [activeGame])

  return (
    <GameLightboxContext.Provider value={{ activeGame, allGames, openLightbox, closeLightbox }}>
      {children}
    </GameLightboxContext.Provider>
  )
}
