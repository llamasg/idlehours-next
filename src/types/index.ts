// src/types/index.ts
// Idle Hours — TypeScript types mirroring Sanity CMS schemas

// ─── Game ──────────────────────────────────────────────
export interface Game {
  _id: string
  title: string
  slug: { current: string }
  coverImage?: string
  shortDescription: string
  platforms: string[]
  genres: string[]
  tags: string[]
  coop: boolean
  /** Legacy ratings — kept for existing data, not shown in UI */
  ratings?: {
    cozyPercent?: number
    brainEffort?: 'Low' | 'Medium' | 'High'
    snackSafe?: boolean
  }
  openCriticScore?: number
  difficulty?: 1 | 2 | 3
  greatSoundtrack?: boolean
  genre?: string[]
  currentPrice?: number
  isFree?: boolean
  lastPriceUpdated?: string
  affiliateLinks?: { label: string; url: string }[]
  featured: boolean
  publishedAt: string
}

// ─── Post (Blog) ──────────────────────────────────────
export interface Post {
  _id: string
  title: string
  slug: { current: string }
  excerpt: string
  mainImage?: string
  coverImageUrl?: string
  category?: any
  tags: string[]
  readTime: number
  readingTime?: number
  featured: boolean
  publishedAt: string
  author?: string
}

// ─── Quiz ────────────────────────────────────────────
export interface Quiz {
  id: string
  title: string
  description: string
  questionCount: number
  emoji?: string
  coverImage?: string
  slug?: { current: string }
}
