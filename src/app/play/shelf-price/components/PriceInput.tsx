'use client'

import { useState, useRef, useEffect } from 'react'
import type { PriceGuess } from '../lib/storage'

interface PriceInputProps {
  onSubmit: (price: number) => void
  onSkip: () => void
  onHint: () => void
  disabled: boolean
  guesses: PriceGuess[]
  actualPrice: number
  hintUsed: boolean
}

export default function PriceInput({
  onSubmit,
  onSkip,
  onHint,
  disabled,
  guesses,
  actualPrice,
  hintUsed,
}: PriceInputProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus the input on mount and when guesses change
  useEffect(() => {
    inputRef.current?.focus()
  }, [guesses.length])

  const handleSubmit = () => {
    setError(null)

    const trimmed = value.trim()
    if (!trimmed) {
      setError('Enter a price')
      return
    }

    const price = parseFloat(trimmed)
    if (isNaN(price)) {
      setError('Enter a valid price')
      return
    }

    if (price < 0 || price > 999.99) {
      setError('Price must be between $0.00 and $999.99')
      return
    }

    setValue('')
    onSubmit(Math.round(price * 100) / 100)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSkip = () => {
    setValue('')
    setError(null)
    onSkip()
  }

  // Filter to only actual guesses (not skips) for the history
  const guessHistory = guesses.filter((g) => g.priceGuessed > 0)

  return (
    <div className="mb-8 flex flex-col items-center gap-4">
      {/* Previous guesses — higher/lower list */}
      {guessHistory.length > 0 && (
        <div className="mb-2 flex w-full max-w-sm flex-col gap-2.5">
          {guessHistory.map((guess, i) => {
            const direction =
              guess.priceGuessed < actualPrice ? 'higher' : 'lower'
            return (
              <div
                key={i}
                className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/30 px-6 py-3"
              >
                <span className="font-heading text-base font-bold tabular-nums text-foreground">
                  ${guess.priceGuessed.toFixed(2)}
                </span>
                <span
                  className={`flex items-center gap-1.5 font-heading text-sm font-semibold ${
                    direction === 'higher'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {direction === 'higher' ? (
                    <>
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                      Higher
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                      Lower
                    </>
                  )}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Input row — stacked on mobile, inline on desktop */}
      <div className="flex w-full max-w-sm flex-col items-center gap-3 lg:max-w-none lg:flex-row lg:justify-center">
        {/* Dollar input with $ prefix */}
        <div className="relative w-full lg:w-[200px]">
          <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 font-heading text-xl font-bold text-muted-foreground">
            $
          </span>
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={value}
            onChange={(e) => {
              // Allow digits, one decimal point, and up to 2 decimal places
              const raw = e.target.value.replace(/[^0-9.]/g, '')
              // Prevent multiple dots
              const parts = raw.split('.')
              const sanitised =
                parts.length > 2
                  ? parts[0] + '.' + parts.slice(1).join('')
                  : raw
              // Limit to 2 decimal places
              if (parts.length === 2 && parts[1].length > 2) return
              setValue(sanitised)
              setError(null)
            }}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className="w-full rounded-full border-2 border-border bg-background pl-10 pr-6 py-3 text-center font-heading text-xl font-bold tabular-nums focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
          />
        </div>

        {/* Submit button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled}
          className="w-full rounded-full bg-primary px-6 py-3 font-heading text-base font-bold text-white transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 lg:w-auto"
        >
          Submit
        </button>

        {/* Skip button */}
        <button
          type="button"
          onClick={handleSkip}
          disabled={disabled}
          className="w-full rounded-full border-2 border-border/60 px-6 py-3 font-heading text-base font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50 lg:w-auto"
        >
          Skip
        </button>
      </div>

      {/* Hint button */}
      {!hintUsed && (
        <button
          type="button"
          onClick={onHint}
          disabled={disabled}
          className="rounded-full border border-border/40 px-4 py-2 font-heading text-sm text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
        >
          Reveal Year (-1★)
        </button>
      )}

      {/* Error message */}
      {error && (
        <p className="font-heading text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
