'use client'

import { useState, useRef, useEffect } from 'react'
import type { CoverAttempt } from '../lib/storage'

interface YearInputProps {
  onSubmit: (year: number) => void
  onSkip: () => void
  disabled: boolean
  attempts: CoverAttempt[]
  answerYear: number
}

export default function YearInput({
  onSubmit,
  onSkip,
  disabled,
  attempts,
  answerYear,
}: YearInputProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus the input on mount and when attempts change (new cover revealed)
  useEffect(() => {
    inputRef.current?.focus()
  }, [attempts.length])

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
    onSubmit(year)
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
  const guessHistory = attempts.filter((a) => !a.skipped && a.yearGuessed > 0)

  return (
    <div className="mb-8 flex flex-col items-center gap-4">
      {/* Previous guesses — higher/lower list */}
      {guessHistory.length > 0 && (
        <div className="mb-2 flex w-full max-w-sm flex-col gap-2.5">
          {guessHistory.map((attempt, i) => {
            const direction = attempt.yearGuessed < answerYear ? 'higher' : 'lower'
            return (
              <div
                key={i}
                className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/30 px-6 py-3"
              >
                <span className="font-heading text-base font-bold tabular-nums text-foreground">
                  {attempt.yearGuessed}
                </span>
                <span className={`flex items-center gap-1.5 font-heading text-sm font-semibold ${
                  direction === 'higher'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {direction === 'higher' ? (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                      </svg>
                      Higher
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
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
        {/* Year input */}
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
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="w-full rounded-full border-2 border-border bg-background px-6 py-3 text-center font-heading text-xl font-bold tabular-nums focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 lg:w-[200px]"
        />

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

      {/* Error message */}
      {error && (
        <p className="font-heading text-sm font-medium text-red-600">{error}</p>
      )}
    </div>
  )
}
