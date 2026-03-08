'use client'

import { useEffect, useState } from 'react'

interface MilestoneToastProps {
  medal: 'bronze' | 'silver' | 'gold'
  triggerId: number // increment to re-trigger
}

const MEDAL_CONFIG = {
  bronze: { emoji: '🥉', label: 'Bronze unlocked!' },
  silver: { emoji: '🥈', label: 'Silver unlocked!' },
  gold: { emoji: '🥇', label: 'Gold unlocked!' },
}

export default function MilestoneToast({ medal, triggerId }: MilestoneToastProps) {
  const [visible, setVisible] = useState(false)
  const [currentMedal, setCurrentMedal] = useState(medal)

  useEffect(() => {
    if (triggerId <= 0) return
    setCurrentMedal(medal)
    setVisible(true)
    const timer = setTimeout(() => setVisible(false), 2000)
    return () => clearTimeout(timer)
  }, [triggerId, medal])

  if (!visible) return null

  const config = MEDAL_CONFIG[currentMedal]

  return (
    <div className="pointer-events-none absolute inset-x-0 top-2 z-20 flex justify-center animate-[milestone-toast_0.4s_ease-out]">
      <div className="rounded-full border border-[hsl(var(--game-amber))]/30 bg-[hsl(var(--game-amber))]/10 px-5 py-2 font-heading text-sm font-bold text-[hsl(var(--game-amber))] shadow-lg backdrop-blur-sm">
        {config.emoji} {config.label}
      </div>
    </div>
  )
}
