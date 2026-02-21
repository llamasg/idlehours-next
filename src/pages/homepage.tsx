import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import SectionRenderer from '@/components/SectionRenderer'
import HomeLoader from '@/components/HomeLoader'
import { getHomePage } from '@/lib/queries'
import type { HomePage } from '@/types'

export default function HomePage() {
  const [homePage, setHomePage] = useState<HomePage | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [animLoading, setAnimLoading] = useState(true)

  useEffect(() => {
    getHomePage()
      .then((data) => setHomePage(data))
      .catch((err) => console.error('[HomePage] Failed to load:', err))
      .finally(() => setDataLoading(false))
  }, [])

  return (
    <>
      {animLoading && <HomeLoader onComplete={() => setAnimLoading(false)} />}

      <div className="min-h-screen bg-background">
        <Header />

        <main className="mx-auto max-w-7xl space-y-10 px-4 py-8 lg:px-8 lg:py-12">
          {dataLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : homePage ? (
            <SectionRenderer sections={homePage.sections} />
          ) : (
            <div className="py-24 text-center text-muted-foreground">
              <p className="font-heading text-lg">Could not load homepage content.</p>
            </div>
          )}
        </main>

        <SiteFooter />
      </div>
    </>
  )
}
