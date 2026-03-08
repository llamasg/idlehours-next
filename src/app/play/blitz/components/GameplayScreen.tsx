'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { type BlitzTopic } from '@/data/blitz-topics'
import { type GameEntry } from '@/data/games-db'
import { type Milestones, getMedalName } from '../lib/milestones'
import { checkGuess } from '../lib/matching'
import BlitzHUD from './BlitzHUD'
import ProgressBar from './ProgressBar'
import PhysicsArena, { type PhysicsArenaHandle } from './PhysicsArena'
import BlitzInput from './BlitzInput'
import MilestoneToast from './MilestoneToast'

interface GameplayScreenProps {
  topic: BlitzTopic
  pool: GameEntry[]
  poolSize: number
  milestones: Milestones
  timeLimit: number
  aliasMap: Map<string, string>
  onGameEnd: (score: number, guessedIds: string[], guessedTitles: string[], timeUsed: number) => void
}

export default function GameplayScreen({
  topic,
  pool,
  poolSize,
  milestones,
  timeLimit,
  aliasMap,
  onGameEnd,
}: GameplayScreenProps) {
  const [score, setScore] = useState(0)
  const [totalGuesses, setTotalGuesses] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(timeLimit)
  const [toastMedal, setToastMedal] = useState<'bronze' | 'silver' | 'gold'>('bronze')
  const [toastTrigger, setToastTrigger] = useState(0)

  const guessedIdsRef = useRef(new Set<string>())
  const guessedTitlesRef = useRef<string[]>([])
  const scoreRef = useRef(0)
  const arenaRef = useRef<PhysicsArenaHandle>(null)
  const startTimeRef = useRef(Date.now())
  const endedRef = useRef(false)

  // Track which milestones have been announced
  const announcedRef = useRef({ bronze: false, silver: false, gold: false })

  // Timer
  useEffect(() => {
    startTimeRef.current = Date.now()

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      const remaining = Math.max(0, timeLimit - elapsed)
      setTimeRemaining(remaining)

      if (remaining <= 0 && !endedRef.current) {
        endedRef.current = true
        clearInterval(interval)
        const timeUsed = timeLimit
        onGameEnd(
          scoreRef.current,
          [...guessedIdsRef.current],
          [...guessedTitlesRef.current],
          timeUsed,
        )
      }
    }, 250)

    return () => clearInterval(interval)
  }, [timeLimit, onGameEnd])

  // Next milestone info
  const nextMilestone = useMemo(() => {
    if (score < milestones.bronze) return { label: '🥉 Bronze', remaining: milestones.bronze - score }
    if (score < milestones.silver) return { label: '🥈 Silver', remaining: milestones.silver - score }
    if (score < milestones.gold) return { label: '🥇 Gold', remaining: milestones.gold - score }
    return { label: '', remaining: 0 }
  }, [score, milestones])

  const handleGuess = useCallback(
    (input: string): 'correct' | 'duplicate' | 'wrong' => {
      setTotalGuesses((n) => n + 1)

      const result = checkGuess(input, aliasMap, guessedIdsRef.current, pool)

      if (result.result === 'correct' && result.gameId) {
        guessedIdsRef.current.add(result.gameId)
        if (result.title) guessedTitlesRef.current.push(result.title)
        const newScore = scoreRef.current + 1
        scoreRef.current = newScore
        setScore(newScore)

        // Spawn pill in arena
        arenaRef.current?.spawnPill(result.title || input, 'correct')

        // Check milestones
        if (newScore >= milestones.gold && !announcedRef.current.gold) {
          announcedRef.current.gold = true
          setToastMedal('gold')
          setToastTrigger((n) => n + 1)
        } else if (newScore >= milestones.silver && !announcedRef.current.silver) {
          announcedRef.current.silver = true
          setToastMedal('silver')
          setToastTrigger((n) => n + 1)
        } else if (newScore >= milestones.bronze && !announcedRef.current.bronze) {
          announcedRef.current.bronze = true
          setToastMedal('bronze')
          setToastTrigger((n) => n + 1)
        }

        return 'correct'
      }

      if (result.result === 'wrong') {
        arenaRef.current?.spawnPill(input, 'wrong')
      }

      return result.result
    },
    [aliasMap, pool, milestones],
  )

  const gameOver = timeRemaining <= 0

  return (
    <div className="flex h-dvh flex-col bg-[hsl(var(--game-cream))]">
      {/* HUD */}
      <BlitzHUD
        topicName={topic.name}
        timeRemaining={timeRemaining}
        timeLimit={timeLimit}
        score={score}
      />

      {/* Progress bar */}
      <ProgressBar score={score} poolSize={poolSize} milestones={milestones} />

      {/* Physics arena — fills remaining space */}
      <div className="relative min-h-0 flex-1">
        <MilestoneToast medal={toastMedal} triggerId={toastTrigger} />
        <PhysicsArena ref={arenaRef} />
      </div>

      {/* Input zone — pinned to bottom */}
      <BlitzInput
        onSubmit={handleGuess}
        disabled={gameOver}
        score={score}
        totalGuesses={totalGuesses}
        nextMilestoneLabel={nextMilestone.label}
        nextMilestoneRemaining={nextMilestone.remaining}
      />
    </div>
  )
}
