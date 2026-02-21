import Link from 'next/link'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-4 font-heading text-6xl font-black text-foreground">404</h1>
        <p className="mb-8 text-xl text-muted-foreground">This page has wandered off somewhere cozy.</p>
        <Link href="/" className="rounded-full bg-primary px-8 py-3 font-heading text-sm font-semibold text-white transition-colors hover:bg-primary/90">
          Go home
        </Link>
      </main>
      <SiteFooter />
    </div>
  )
}
