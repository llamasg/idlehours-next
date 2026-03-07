'use client'

import { useState } from 'react'

interface StartScreenProps {
  onStart: (gameName: string) => void
}

export default function StartScreen({ onStart }: StartScreenProps) {
  const [gameName, setGameName] = useState('')

  const isValid = gameName.trim().length >= 2

  const handleSubmit = () => {
    if (isValid) onStart(gameName.trim())
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 text-center">
      {/* Branded header */}
      <div className="mb-6 flex items-center justify-center gap-2">
        <span className="font-heading text-xs uppercase tracking-wider text-muted-foreground">
          a game by
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/icons/icon_Idlehours logo horizontal-wide-mobile header.svg"
          alt="Idle Hours"
          className="h-4 w-auto opacity-40 dark:invert"
          draggable={false}
        />
      </div>

      {/* Title */}
      <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
        Ship It
      </h1>

      {/* Subtitle */}
      <p className="mx-auto mt-3 max-w-sm text-base text-muted-foreground">
        You made something beautiful. Now comes the hard part.
      </p>

      {/* Name input */}
      <div className="mx-auto mt-8 max-w-sm text-left">
        <label
          htmlFor="game-name"
          className="mb-2 block font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          What&apos;s your game called?
        </label>
        <input
          id="game-name"
          type="text"
          placeholder="e.g. Meadow, Driftwood, The Quiet Hours…"
          maxLength={32}
          value={gameName}
          onChange={(e) => setGameName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Objective box */}
      <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-border/60 bg-card p-5 text-left">
        <h2 className="font-heading text-sm font-bold text-foreground">
          &#9670; Your Objective
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          You&apos;re an indie dev with a game, a dream, and $300 in the bank.
          Each day brings a new offer from a publisher. Some will help. Most
          will not. Keep the lights on. Survive three rounds of meetings. Launch
          with your integrity mostly intact.
        </p>
        <p className="mt-3 text-sm font-semibold text-foreground">
          Goal: At least Mostly Positive reviews on launch day.
        </p>
      </div>

      {/* Start button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!isValid}
        className="mx-auto mt-8 block rounded-full bg-primary px-6 py-3 font-heading text-sm font-semibold text-white transition-colors hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-40"
      >
        &#9654; Enter the meetings
      </button>
    </div>
  )
}
