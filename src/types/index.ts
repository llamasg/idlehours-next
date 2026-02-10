// src/types/index.ts
// Idle Hours — TypeScript types mirroring Sanity CMS schemas

// ─── Link ──────────────────────────────────────────────
export interface CmsLink {
  label: string
  linkType: 'internal' | 'external'
  internalRef?: { _type: string; slug: { current: string } }
  externalUrl?: string
}

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
  ratings: {
    cozyPercent: number
    brainEffort: 'Low' | 'Medium' | 'High'
    snackSafe: boolean
  }
  affiliateLinks?: { label: string; url: string }[]
  longDescription?: any[] // Portable Text blocks
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
  category?: { _id: string; title: string; slug: { current: string } }
  tags: string[]
  readTime: number
  featured: boolean
  publishedAt: string
  author?: string
}

// ─── Product (Affiliate) ──────────────────────────────
export interface Product {
  _id: string
  name: string
  slug?: { current: string }
  image?: string
  shortDescription: string
  price?: string
  retailerName?: string
  affiliateUrl: string
  tags: string[]
  featured: boolean
}

// ─── Category ─────────────────────────────────────────
export interface Category {
  _id: string
  title: string
  slug: { current: string }
  description?: string
}

// ─── Homepage Section Types ───────────────────────────

export interface HeroSection {
  _type: 'heroSection'
  _key: string
  enabled: boolean
  headline: string
  subheadline?: string
  heroImage?: string
  primaryButton?: CmsLink
  secondaryButton?: CmsLink
  tags?: string[]
}

export interface CarouselRowSection {
  _type: 'carouselRowSection'
  _key: string
  enabled: boolean
  rowTitle: string
  rowSubtitle?: string
  rowType: 'games' | 'posts' | 'products'
  sourceType: 'curated' | 'dynamic'
  curatedGames?: Game[]
  curatedPosts?: Post[]
  curatedProducts?: Product[]
  seeAllLink?: CmsLink
}

export interface QuizCtaSection {
  _type: 'quizCtaSection'
  _key: string
  enabled: boolean
  title: string
  description: string
  buttonLabel: string
  link: CmsLink
  icon?: string
}

export interface GameOfMonthSection {
  _type: 'gameOfMonthSection'
  _key: string
  enabled: boolean
  title?: string
  featuredGame: Game
  customBlurb?: string
  buttonLabel?: string
  link?: CmsLink
}

export interface ProductFeatureSection {
  _type: 'productFeatureSection'
  _key: string
  enabled: boolean
  title: string
  subtitle?: string
  products: Product[]
  cta?: CmsLink
}

export interface BlogFeatureSection {
  _type: 'blogFeatureSection'
  _key: string
  enabled: boolean
  title: string
  subtitle?: string
  sourceType: 'curated' | 'dynamic'
  curatedPosts?: Post[]
}

export interface NewsletterSection {
  _type: 'newsletterSection'
  _key: string
  enabled: boolean
  title: string
  copy?: string
  placeholderText: string
  buttonLabel: string
  disclaimer?: string
}

// ─── Music Track ─────────────────────────────────────
export interface MusicTrack {
  _id: string
  title: string
  artist: string
  audioUrl: string
  coverArt?: string
  order?: number
}

export type HomepageSection =
  | HeroSection
  | CarouselRowSection
  | QuizCtaSection
  | GameOfMonthSection
  | ProductFeatureSection
  | BlogFeatureSection
  | NewsletterSection

export interface HomePage {
  _id: string
  title: string
  sections: HomepageSection[]
}
