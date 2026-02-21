import Hero from './Hero'
import RowCarousel from './RowCarousel'
import GameTileCard from './GameTileCard'
import BlogTileCard from './BlogTileCard'
import ProductTileCard from './ProductTileCard'
import QuizCta from './QuizCta'
import GameOfMonth from './GameOfMonth'
import ProductFeature from './ProductFeature'
import BlogFeature from './BlogFeature'
import Newsletter from './Newsletter'

import type { HomepageSection } from '@/types'

interface SectionRendererProps {
  sections: HomepageSection[]
}

export default function SectionRenderer({ sections }: SectionRendererProps) {
  return (
    <>
      {sections.map((section) => {
        // Skip disabled sections
        if (!section.enabled) return null

        switch (section._type) {
          case 'heroSection':
            return <Hero key={section._key} data={section} />

          case 'carouselRowSection': {
            const items =
              section.rowType === 'games'
                ? section.curatedGames
                : section.rowType === 'posts'
                  ? section.curatedPosts
                  : section.curatedProducts

            if (!items || items.length === 0) return null

            return (
              <RowCarousel
                key={section._key}
                title={section.rowTitle}
                subtitle={section.rowSubtitle}
                seeAllLink={section.seeAllLink}
              >
                {section.rowType === 'games' &&
                  section.curatedGames?.map((game) => (
                    <div key={game._id} className="w-[220px] sm:w-[240px] shrink-0 snap-start">
                      <GameTileCard game={game} />
                    </div>
                  ))}
                {section.rowType === 'posts' &&
                  section.curatedPosts?.map((post) => (
                    <BlogTileCard key={post._id} post={post} />
                  ))}
                {section.rowType === 'products' &&
                  section.curatedProducts?.map((product) => (
                    <div key={product._id} className="w-[200px] shrink-0 snap-start">
                      <ProductTileCard product={product} />
                    </div>
                  ))}
              </RowCarousel>
            )
          }

          case 'quizCtaSection':
            return <QuizCta key={section._key} data={section} />

          case 'gameOfMonthSection':
            return <GameOfMonth key={section._key} data={section} />

          case 'productFeatureSection':
            return <ProductFeature key={section._key} data={section} />

          case 'blogFeatureSection':
            return <BlogFeature key={section._key} data={section} />

          case 'newsletterSection':
            return <Newsletter key={section._key} data={section} />

          default:
            return null
        }
      })}
    </>
  )
}
