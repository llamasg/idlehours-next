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
      <p className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        a game by Idle Hours
      </p>

      {/* Title — matches Game Sense / Shelf Price / Street Date */}
      <h1 className="mt-2 text-[clamp(40px,8vw,64px)] font-black uppercase leading-none text-[hsl(var(--game-blue))]">
        Ship It
      </h1>

      {/* Subtitle */}
      <p className="mt-2 text-xs text-muted-foreground">
        Navigate publishers. Launch your indie game.
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
          className="w-full rounded-xl border-2 border-border bg-white px-4 py-3 font-heading text-base text-foreground placeholder:text-muted-foreground/50 focus:border-[hsl(var(--game-blue))]/40 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--game-blue))]/30"
        />
      </div>

      {/* Objective box */}
      <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-border/60 bg-card p-5 text-left">
        <h2 className="font-heading text-sm font-bold text-[hsl(var(--game-ink))]">
          &#9670; Your Objective
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          You&apos;re an indie dev with a game, a dream, and $300 in the bank.
          Each day brings a new offer from a publisher. Some will help. Most
          will not. Keep the lights on. Survive three rounds of meetings. Launch
          with your integrity mostly intact.
        </p>
        <p className="mt-3 text-sm font-semibold text-[hsl(var(--game-ink))]">
          Goal: At least Mostly Positive reviews on launch day.
        </p>
      </div>

      {/* Start button — matches game style */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!isValid}
        className="mx-auto mt-8 block rounded-full bg-[hsl(var(--game-blue))] px-8 py-3 font-heading text-sm font-bold text-white transition-all hover:scale-105 hover:bg-[hsl(var(--game-blue-dark))] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
      >
        Start Playing
      </button>
    </div>
  )
}
