'use client'

import { useState, useRef, useEffect } from 'react'

interface GuessHistoryEntry {
  year: number
  direction: 'too-low' | 'too-high' | 'correct'
}

interface YearInputProps {
  onSubmit: (year: number) => void
  disabled: boolean
  guessHistory: GuessHistoryEntry[]
  attemptsUsed: number
  maxAttempts: number
}

export default function YearInput({
  onSubmit,
  disabled,
  guessHistory,
  attemptsUsed,
  maxAttempts,
}: YearInputProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [historyIndex, setHistoryIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [guessHistory.length])

  const handleSubmit = () => {
    setError(null)

    const trimmed = value.trim()
    if (!trimmed) {
      setError('Enter a 4-digit year')
      return
    }

    const year = parseInt(trimmed, 10)
    if (isNaN(year) || trimmed.length !== 4) {
      setError('Enter a valid 4-digit year')
      return
    }

    if (year < 1970 || year > 2030) {
      setError('Year must be between 1970 and 2030')
      return
    }

    setValue('')
    setHistoryIndex(-1)
    onSubmit(year)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'ArrowUp' && guessHistory.length > 0) {
      e.preventDefault()
      const yearHistory = guessHistory.map((g) => g.year)
      const nextIndex = historyIndex < yearHistory.length - 1 ? historyIndex + 1 : historyIndex
      setHistoryIndex(nextIndex)
      setValue(String(yearHistory[yearHistory.length - 1 - nextIndex]))
    } else if (e.key === 'ArrowDown' && historyIndex > 0) {
      e.preventDefault()
      const yearHistory = guessHistory.map((g) => g.year)
      const nextIndex = historyIndex - 1
      setHistoryIndex(nextIndex)
      setValue(String(yearHistory[yearHistory.length - 1 - nextIndex]))
    }
  }

  return (
    <div className="mb-8 flex flex-col items-center gap-4">
      {/* Attempt dots */}
      <div className="flex items-center gap-2">
        {Array.from({ length: maxAttempts }, (_, i) => (
          <div
            key={i}
            className={`h-2.5 w-2.5 rounded-full transition-all ${
              i < attemptsUsed
                ? 'bg-[hsl(var(--game-amber))]'
                : 'bg-[hsl(var(--game-ink))]/15'
            }`}
          />
        ))}
        <span className="ml-1 font-heading text-xs text-muted-foreground">
          {attemptsUsed}/{maxAttempts}
        </span>
      </div>

      {/* Guess history chips */}
      {guessHistory.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[...guessHistory].reverse().map((entry, i) => (
            <div
              key={i}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-heading text-sm font-bold ${
                entry.direction === 'correct'
                  ? 'border-[hsl(var(--game-green))]/40 bg-[hsl(var(--game-green))]/10 text-[hsl(var(--game-green))]'
                  : entry.direction === 'too-low'
                  ? 'border-blue-500/30 bg-blue-500/10 text-blue-600'
                  : 'border-red-500/30 bg-red-500/10 text-red-600'
              }`}
            >
              {entry.year}
              {entry.direction === 'too-low' && (
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
              )}
              {entry.direction === 'too-high' && (
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              )}
              {entry.direction === 'correct' && (
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex w-full max-w-sm flex-col items-center gap-3 lg:max-w-none lg:flex-row lg:justify-center">
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]{4}"
          maxLength={4}
          placeholder="Year"
          value={value}
          onChange={(e) => {
            setValue(e.target.value.replace(/[^0-9]/g, ''))
            setError(null)
            setHistoryIndex(-1)
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="w-full rounded-xl border-2 border-border bg-white px-6 py-3 text-center font-heading text-xl font-bold tabular-nums focus:border-[hsl(var(--game-blue))]/40 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--game-blue))]/30 disabled:opacity-50 lg:w-[200px]"
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled}
          className="w-full rounded-xl bg-[hsl(var(--game-blue))] px-6 py-3 font-heading text-base font-bold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 lg:w-auto"
        >
          Submit
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p className="font-heading text-sm font-medium text-[hsl(var(--game-red))]">{error}</p>
      )}
    </div>
  )
}
