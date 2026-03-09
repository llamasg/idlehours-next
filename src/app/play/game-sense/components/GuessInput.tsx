'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { GAMES, type GameSenseGame } from '../data/games'

interface GuessInputProps {
  onGuess: (game: GameSenseGame) => void
  guessedIds: string[]
  disabled: boolean
}

// ── Fuzzy matching ──────────────────────────────────────────────────────────

/** Normalize text for fuzzy comparison: lowercase, strip accents, collapse punctuation */
function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // strip accents (é→e, ü→u)
    .toLowerCase()
    .replace(/&/g, 'and')             // & → and
    .replace(/[:;\-–—]/g, ' ')        // punctuation → space
    .replace(/['']/g, '')             // remove apostrophes
    .replace(/\s+/g, ' ')            // collapse whitespace
    .trim()
}

function fuzzyMatch(query: string, title: string): boolean {
  const nq = normalize(query)
  const nt = normalize(title)
  if (nt.includes(nq)) return true
  const words = nq.split(' ')
  let pos = 0
  for (const word of words) {
    const idx = nt.indexOf(word, pos)
    if (idx === -1) return false
    pos = idx + word.length
  }
  return true
}

function matchScore(query: string, title: string): number {
  const nq = normalize(query)
  const nt = normalize(title)
  if (nt === nq) return 0
  if (nt.startsWith(nq)) return 1
  const idx = nt.indexOf(nq)
  if (idx >= 0) return 2 + idx
  return 100
}

// ── Component ───────────────────────────────────────────────────────────────

export default function GuessInput({ onGuess, guessedIds, disabled }: GuessInputProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // Filter matches based on what the user actually typed
  const matches =
    query.length >= 2
      ? GAMES.filter(
          (g) => !guessedIds.includes(g.id) && fuzzyMatch(query, g.title),
        ).sort((a, b) => matchScore(query, a.title) - matchScore(query, b.title))
      : []

  const showDropdown = isOpen && query.length >= 2

  // Ghost suggestion: the highlighted match's title (shown as greyed-out completion)
  const ghostTitle = showDropdown && matches[highlightIndex] ? matches[highlightIndex].title : ''
  // Only show ghost if the title starts with the query (case-insensitive)
  const showGhost = ghostTitle && normalize(ghostTitle).startsWith(normalize(query))
  // Build the ghost text: user's typed text + the remaining completion in grey
  const ghostSuffix = showGhost ? ghostTitle.slice(query.length) : ''

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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
        ;(items[highlightIndex] as HTMLElement).scrollIntoView({ block: 'nearest' })
      }
    }
  }, [highlightIndex])

  const submitGuess = useCallback(() => {
    // Try exact match on query first, then on ghost suggestion
    const trimmed = query.trim()
    const exact = GAMES.find(
      (g) => !guessedIds.includes(g.id) && normalize(g.title) === normalize(trimmed),
    )
    // If no exact match but ghost is showing, try submitting the ghost title
    const target = exact ?? (ghostTitle ? GAMES.find(
      (g) => !guessedIds.includes(g.id) && normalize(g.title) === normalize(ghostTitle),
    ) : undefined)
    if (target) {
      onGuess(target)
      setQuery('')
      setIsOpen(false)
      setHighlightIndex(0)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [query, ghostTitle, guessedIds, onGuess])

  function acceptGhost() {
    if (ghostTitle) {
      setQuery(ghostTitle)
      setIsOpen(false)
      setHighlightIndex(0)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      submitGuess()
      return
    }

    if (e.key === 'Escape') {
      setIsOpen(false)
      return
    }

    // Tab: accept ghost suggestion if showing, otherwise cycle highlights
    if (e.key === 'Tab') {
      if (!showDropdown || matches.length === 0) return
      e.preventDefault()
      if (ghostSuffix) {
        // Accept current ghost
        acceptGhost()
      } else {
        // Cycle through matches
        setHighlightIndex((prev) => (prev + 1) % matches.length)
      }
      return
    }

    // ArrowRight at end of input: accept ghost suggestion
    if (e.key === 'ArrowRight') {
      const input = inputRef.current
      if (input && input.selectionStart === input.value.length && ghostSuffix) {
        e.preventDefault()
        acceptGhost()
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!showDropdown) {
        setIsOpen(true)
        return
      }
      setHighlightIndex((prev) => (prev < matches.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!showDropdown) return
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : matches.length - 1))
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setQuery(value)
    setIsOpen(true)
    setHighlightIndex(0)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-stretch gap-0 rounded-lg border border-[hsl(var(--game-ink))]/15 bg-[hsl(var(--game-cream))] focus-within:ring-2 focus-within:ring-[hsl(var(--game-blue))]/30">
        {/* Ghost suggestion layer — sits behind the real input */}
        <div className="pointer-events-none absolute inset-0 flex items-center px-4 py-3">
          <span className="text-transparent">{query}</span>
          {ghostSuffix && (
            <span className="text-[hsl(var(--game-ink))]/30">{ghostSuffix}</span>
          )}
        </div>
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
          className="relative min-w-0 flex-1 rounded-l-lg bg-transparent px-4 py-3 text-[hsl(var(--game-ink))] placeholder:text-[hsl(var(--game-ink-light))] focus:outline-none disabled:opacity-50"
        />
        <button
          type="button"
          onClick={submitGuess}
          disabled={disabled || !query.trim()}
          className="flex w-12 flex-shrink-0 items-center justify-center rounded-r-lg border-l border-[hsl(var(--game-ink))]/15 text-[hsl(var(--game-ink-light))] transition-colors hover:bg-[hsl(var(--game-ink))]/5 hover:text-[hsl(var(--game-ink))] disabled:opacity-30"
          aria-label="Submit guess"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>

      {showDropdown && (
        <ul
          ref={listRef}
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-[hsl(var(--game-ink))]/15 bg-white shadow-lg"
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
                    ? 'bg-[hsl(var(--game-blue))]/10 text-[hsl(var(--game-ink))]'
                    : 'text-[hsl(var(--game-ink-mid))] hover:bg-[hsl(var(--game-blue))]/5 hover:text-[hsl(var(--game-ink))]'
                }`}
                onMouseEnter={() => setHighlightIndex(i)}
                onMouseDown={(e) => {
                  e.preventDefault()
                  setQuery(game.title)
                  setIsOpen(false)
                  setHighlightIndex(0)
                  setTimeout(() => inputRef.current?.focus(), 0)
                }}
              >
                {game.title}{' '}
                <span className="opacity-60">({game.year})</span>
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-sm text-[hsl(var(--game-ink-light))]">
              No matching games found
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
