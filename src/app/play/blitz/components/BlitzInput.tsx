'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import ProgressBar from './ProgressBar'
import { type Milestones } from '../lib/milestones'

interface BlitzInputProps {
  onSubmit: (text: string) => 'correct' | 'duplicate' | 'wrong'
  disabled: boolean
  score: number
  totalGuesses: number
  poolSize: number
  milestones: Milestones
  nextMilestoneLabel: string
  nextMilestoneRemaining: number
}

export default function BlitzInput({
  onSubmit,
  disabled,
  score,
  totalGuesses,
  poolSize,
  milestones,
  nextMilestoneLabel,
  nextMilestoneRemaining,
}: BlitzInputProps) {
  const [value, setValue] = useState('')
  const [shake, setShake] = useState(false)
  const [float, setFloat] = useState<{ text: string; color: string; key: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const floatKey = useRef(0)
  const lastSentRef = useRef('')

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const showFloat = useCallback((text: string, color: string) => {
    floatKey.current++
    setFloat({ text, color, key: floatKey.current })
    setTimeout(() => setFloat(null), 900)
  }, [])

  const triggerShake = useCallback(() => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }, [])

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed) return

    lastSentRef.current = trimmed
    const result = onSubmit(trimmed)
    setValue('')

    if (result === 'correct') {
      showFloat('+1', 'text-emerald-500')
    } else if (result === 'duplicate') {
      triggerShake()
      showFloat('Already got it', 'text-[hsl(var(--game-amber))]')
    } else {
      triggerShake()
      showFloat('Nope', 'text-[hsl(var(--game-red))]')
    }

    inputRef.current?.focus()
  }, [value, onSubmit, showFloat, triggerShake])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSubmit()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (lastSentRef.current) {
          setValue(lastSentRef.current)
        }
      }
    },
    [handleSubmit],
  )

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Float feedback */}
      <div className="relative h-6">
        {float && (
          <div
            key={float.key}
            className={`absolute left-1/2 -translate-x-1/2 font-heading text-sm font-bold ${float.color} animate-[float-up_0.9s_ease-out_forwards] pointer-events-none whitespace-nowrap`}
          >
            {float.text}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-[420px] min-w-[280px] px-1">
        <ProgressBar score={score} poolSize={poolSize} milestones={milestones} />
      </div>

      {/* Input row */}
      <div
        className={`mt-1.5 flex w-full max-w-[420px] min-w-[280px] gap-2 ${shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Type a game title..."
          autoComplete="off"
          className="min-w-0 flex-1 rounded-lg border-[1.5px] border-[hsl(var(--game-amber))] bg-[hsl(var(--game-white))] px-4 py-3 font-heading text-sm text-[hsl(var(--game-ink))] shadow-[0_0_0_4px_rgba(200,135,58,0.15)] placeholder:text-[hsl(var(--game-ink-light))]/50 focus:outline-none focus:shadow-[0_0_0_6px_rgba(200,135,58,0.25)] disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className="flex-shrink-0 rounded-lg bg-[hsl(var(--game-amber))] px-5 py-3 font-heading text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-50"
        >
          Go
        </button>
      </div>

      {/* Hint row */}
      <div className="mt-1 flex items-center justify-center gap-2 text-[11px] text-[hsl(var(--game-ink-light))]">
        <span>{score} correct</span>
        <span>·</span>
        <span>{totalGuesses} guesses</span>
        {nextMilestoneRemaining > 0 && (
          <>
            <span>·</span>
            <span>
              {nextMilestoneLabel}: {nextMilestoneRemaining} to go
            </span>
          </>
        )}
      </div>
    </div>
  )
}
