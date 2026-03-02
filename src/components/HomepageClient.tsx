'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import ParallaxHero from '@/components/ParallaxHero'
import SectionLabel from '@/components/SectionLabel'
import PlayOurGames from '@/components/homepage/PlayOurGames'
import LatestPosts from '@/components/homepage/LatestPosts'
import TodaysPick from '@/components/homepage/TodaysPick'
import WhatWerePlaying from '@/components/homepage/WhatWerePlaying'
import HomepageNewsletter from '@/components/homepage/HomepageNewsletter'
import LongRead from '@/components/homepage/LongRead'
import HomepageFooter from '@/components/homepage/HomepageFooter'
import type { Game } from '@/types'

const fadeUp = {
  initial: { opacity: 0, y: 50 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' as const },
  transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
}

interface HomepageClientProps {
  games: Game[]
  posts: any[]
  featuredPost: any | null
}

export default function HomepageClient({ games, posts, featuredPost }: HomepageClientProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  // Featured/curated games for "What We're Playing" — featured first, pad with remaining
  const featured = games.filter((g) => g.featured)
  const nonFeatured = games.filter((g) => !g.featured)
  const whatWerePlaying = [...featured, ...nonFeatured].slice(0, 12)

  // Today's pick — rotate daily through the game library using day-of-year
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  const todaysPick = games.length > 0 ? games[dayOfYear % games.length] : null

  return (
    <div className="min-h-screen bg-background">
      <Header transparent />
      <ParallaxHero contentRef={contentRef} />

      {/* Content sections — pulled up into the postcard via contentRef margin */}
      <div
        ref={contentRef}
        className="relative z-20 mx-auto max-w-[1280px] space-y-16 px-4 pb-8 lg:px-8 [@media(min-width:1800px)]:max-w-[1350px]"
      >
        {/* 1. Play Our Games */}
        <motion.section {...fadeUp}>
          <SectionLabel label="PLAY A GAME" />
          <div className="mt-6">
            <PlayOurGames />
          </div>
        </motion.section>

        {/* 2. Latest Posts */}
        {posts.length > 0 && (
          <motion.section {...fadeUp}>
            <SectionLabel label="LATEST POSTS" />
            <div className="mt-6">
              <LatestPosts posts={posts} />
            </div>
          </motion.section>
        )}

        {/* 3. Today's Pick */}
        <motion.section {...fadeUp}>
          <SectionLabel label="TODAY'S PICK" />
          <div className="mt-6">
            <TodaysPick game={todaysPick} />
          </div>
        </motion.section>

        {/* 4. What We're Playing — heading + arrows are built into the component */}
        {whatWerePlaying.length > 0 && (
          <motion.section {...fadeUp}>
            <WhatWerePlaying games={whatWerePlaying} />
          </motion.section>
        )}

        {/* 5. Newsletter */}
        <motion.section {...fadeUp}>
          <HomepageNewsletter />
        </motion.section>

        {/* 6. Long Read */}
        {featuredPost && (
          <motion.section {...fadeUp}>
            <SectionLabel label="LONG READ" />
            <div className="mt-6">
              <LongRead post={featuredPost} />
            </div>
          </motion.section>
        )}
      </div>

      <HomepageFooter />
    </div>
  )
}
