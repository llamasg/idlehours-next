import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import SectionRenderer from '@/components/SectionRenderer'
import { getHomePage } from '@/lib/queries'

export default async function HomePage() {
  const homePage = await getHomePage()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl space-y-10 px-4 py-8 lg:px-8 lg:py-12">
        {homePage ? (
          <SectionRenderer sections={homePage.sections} />
        ) : (
          <div className="py-24 text-center text-muted-foreground">
            <p className="font-heading text-lg">Could not load homepage content.</p>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
