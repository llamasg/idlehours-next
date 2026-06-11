'use client'

// Thin binding over the shell's GameSearchInput (the typeahead was promoted
// identity → structural when Stock Room became its second consumer).
// Game Sense's pool is the full db with vibe/genres/platforms/pegi non-null,
// which is currently every entry — the cast below is the binding's contract.

import GameSearchInput from '@/components/games/shell/GameSearchInput'
import type { GameSenseGame } from '../data/games'

interface GuessInputProps {
  onGuess: (game: GameSenseGame) => void
  guessedIds: string[]
  disabled: boolean
}

export default function GuessInput({ onGuess, guessedIds, disabled }: GuessInputProps) {
  return (
    <GameSearchInput
      onSelect={(game) => onGuess(game as GameSenseGame)}
      excludeIds={guessedIds}
      disabled={disabled}
    />
  )
}
