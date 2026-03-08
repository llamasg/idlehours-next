'use client'

import { useState, useMemo, useCallback } from 'react'
import { GAMES_DB, type GameEntry } from '@/data/games-db'
import { BLITZ_TOPICS, type BlitzTopic } from '@/data/blitz-topics'
import { getMilestones, getTimeLimit, getMedalName, type MedalName } from './lib/milestones'
import { buildAliasMap } from './lib/matching'
import TopicSelectScreen from './components/TopicSelectScreen'
import GameplayScreen from './components/GameplayScreen'
import EndScreen from './components/EndScreen'
import LeaderboardScreen from './components/LeaderboardScreen'

type Screen = 'select' | 'game' | 'end' | 'leaderboard'

export interface GameResult {
  score: number
  guessedIds: string[]
  guessedTitles: string[]
  timeUsed: number
  pool: GameEntry[]
  topic: BlitzTopic
  medal: MedalName
}

export default function BlitzPage() {
  const [screen, setScreen] = useState<Screen>('select')
  const [selectedTopic, setSelectedTopic] = useState<BlitzTopic | null>(null)
  const [gameResult, setGameResult] = useState<GameResult | null>(null)
  const [playerName, setPlayerName] = useState<string | null>(null)

  // Compute available topics with pool sizes in 15-150 range
  const availableTopics = useMemo(() => {
    return BLITZ_TOPICS.map((topic) => {
      const pool = GAMES_DB.filter(topic.filter)
      return { topic, pool, poolSize: pool.length }
    }).filter((t) => t.poolSize >= 15 && t.poolSize <= 150)
  }, [])

  const selectedData = useMemo(() => {
    if (!selectedTopic) return null
    const entry = availableTopics.find((t) => t.topic.slug === selectedTopic.slug)
    if (!entry) return null
    return {
      ...entry,
      milestones: getMilestones(entry.poolSize),
      timeLimit: getTimeLimit(entry.poolSize),
      aliasMap: buildAliasMap(entry.pool),
    }
  }, [selectedTopic, availableTopics])

  const handleStart = useCallback(() => {
    if (!selectedData) return
    setScreen('game')
  }, [selectedData])

  const handleGameEnd = useCallback(
    (score: number, guessedIds: string[], guessedTitles: string[], timeUsed: number) => {
      if (!selectedData || !selectedTopic) return
      const milestones = getMilestones(selectedData.poolSize)
      setGameResult({
        score,
        guessedIds,
        guessedTitles,
        timeUsed,
        pool: selectedData.pool,
        topic: selectedTopic,
        medal: getMedalName(score, milestones),
      })
      setScreen('end')
    },
    [selectedData, selectedTopic],
  )

  const handleShowLeaderboard = useCallback((name: string | null) => {
    setPlayerName(name)
    if (name) {
      try { sessionStorage.setItem('blitz_player_name', name) } catch {}
    }
    setScreen('leaderboard')
  }, [])

  const handlePlayAgain = useCallback(() => {
    setGameResult(null)
    setScreen('select')
  }, [])

  return (
    <>
      {screen === 'select' && (
        <TopicSelectScreen
          topics={availableTopics}
          selectedTopic={selectedTopic}
          onSelectTopic={setSelectedTopic}
          onStart={handleStart}
        />
      )}

      {screen === 'game' && selectedData && selectedTopic && (
        <GameplayScreen
          topic={selectedTopic}
          pool={selectedData.pool}
          poolSize={selectedData.poolSize}
          milestones={selectedData.milestones}
          timeLimit={selectedData.timeLimit}
          aliasMap={selectedData.aliasMap}
          onGameEnd={handleGameEnd}
        />
      )}

      {screen === 'end' && gameResult && (
        <EndScreen
          result={gameResult}
          onPlayAgain={handlePlayAgain}
          onShowLeaderboard={handleShowLeaderboard}
        />
      )}

      {screen === 'leaderboard' && gameResult && (
        <LeaderboardScreen
          topic={gameResult.topic}
          poolSize={gameResult.pool.length}
          playerName={playerName}
          onChangeTopic={handlePlayAgain}
        />
      )}
    </>
  )
}
