'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { GAMES, type SkillIssueGame } from '../data/games'

interface GuessInputProps {
  onGuess: (game: SkillIssueGame) => void
  guessedIds: string[]
  disabled: boolean
}

export default function GuessInput({ onGuess, guessedIds, disabled }: GuessInputProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // Filter games based on query and already-guessed ids
  const matches =
    query.length >= 2
      ? GAMES.filter(
          (g) =>
            !guessedIds.includes(g.id) &&
            g.title.toLowerCase().includes(query.toLowerCase()),
        )
      : []

  const showDropdown = isOpen && query.length >= 2

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const items = listRef.current.children
      if (items[highlightIndex]) {
        ;(items[highlightIndex] as HTMLElement).scrollIntoView({
          block: 'nearest',
        })
      }
    }
  }, [highlightIndex])

  const selectGame = useCallback(
    (game: SkillIssueGame) => {
      onGuess(game)
      setQuery('')
      setIsOpen(false)
      setHighlightIndex(-1)
      // Refocus input after selection
      setTimeout(() => inputRef.current?.focus(), 0)
    },
    [onGuess],
  )

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown || matches.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex((prev) =>
        prev < matches.length - 1 ? prev + 1 : 0,
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex((prev) =>
        prev > 0 ? prev - 1 : matches.length - 1,
      )
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightIndex >= 0 && highlightIndex < matches.length) {
        selectGame(matches[highlightIndex])
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setQuery(value)
    setIsOpen(true)
    setHighlightIndex(-1)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => query.length >= 2 && setIsOpen(true)}
        placeholder="Type a game title..."
        disabled={disabled}
        autoComplete="off"
        className="w-full rounded-lg border border-border bg-background px-4 py-3 font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
      />

      {showDropdown && (
        <ul
          ref={listRef}
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-card shadow-lg"
          role="listbox"
        >
          {matches.length > 0 ? (
            matches.map((game, i) => (
              <li
                key={game.id}
                role="option"
                aria-selected={i === highlightIndex}
                className={`cursor-pointer px-4 py-2 text-sm transition-colors ${
                  i === highlightIndex
                    ? 'bg-primary/10 text-foreground'
                    : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground'
                }`}
                onMouseEnter={() => setHighlightIndex(i)}
                onMouseDown={(e) => {
                  // Prevent input blur before selection registers
                  e.preventDefault()
                  selectGame(game)
                }}
              >
                {game.title}{' '}
                <span className="opacity-60">({game.year})</span>
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-sm text-muted-foreground">
              No matching games found
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
