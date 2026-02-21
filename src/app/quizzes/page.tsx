import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import { getAllQuizzes } from '@/lib/queries'

export const metadata = { title: 'Quizzes' }

export default async function QuizzesPage() {
  const quizzes = await getAllQuizzes()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-heading text-4xl font-black text-foreground md:text-5xl">Quizzes</h1>
          <p className="text-lg text-muted-foreground">Find your cozy gaming match</p>
        </div>
        {quizzes && quizzes.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz: { _id: string; title: string; description?: string; emoji?: string }) => (
              <div key={quiz._id} className="rounded-2xl border border-border/40 bg-card p-6">
                {quiz.emoji && <div className="mb-3 text-4xl">{quiz.emoji}</div>}
                <h2 className="mb-2 font-heading text-xl font-bold text-foreground">{quiz.title}</h2>
                {quiz.description && (
                  <p className="text-sm text-muted-foreground">{quiz.description}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border/40 bg-card p-16 text-center">
            <p className="text-2xl text-muted-foreground">Quizzes coming soon</p>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
