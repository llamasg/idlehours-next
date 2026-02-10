import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import SectionRenderer from '@/components/SectionRenderer'
import { mockHomePage } from '@/data/mock-data'

// In the future, this will fetch from Sanity CMS:
//   const homePage = await getHomePage()
// For now we use mock data.

export default function HomePage() {
  const homePage = mockHomePage

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl space-y-10 px-4 py-8 lg:px-8 lg:py-12">
        <SectionRenderer sections={homePage.sections} />
      </main>

      <SiteFooter />
    </div>
  )
}
