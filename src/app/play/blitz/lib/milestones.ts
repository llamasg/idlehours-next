export interface Milestones {
  bronze: number
  silver: number
  gold: number
}

export function getTimeLimit(poolSize: number): number {
  return poolSize * 2 + 15
}

export function getMilestones(poolSize: number): Milestones {
  return {
    bronze: Math.max(3, Math.floor(poolSize * 0.15)),
    silver: Math.max(6, Math.floor(poolSize * 0.30)),
    gold: Math.max(10, Math.floor(poolSize * 0.50)),
  }
}

export type MedalName = 'gold' | 'silver' | 'bronze' | null

export function getMedalName(score: number, milestones: Milestones): MedalName {
  if (score >= milestones.gold) return 'gold'
  if (score >= milestones.silver) return 'silver'
  if (score >= milestones.bronze) return 'bronze'
  return null
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
