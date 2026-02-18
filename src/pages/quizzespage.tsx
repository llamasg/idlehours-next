import { useState, useEffect } from "react";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import QuizCard from "@/components/QuizCard";
import { motion } from "framer-motion";
import { getAllQuizzes } from "@/lib/queries";
import type { Quiz } from "@/types";

const sectionVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const data = await getAllQuizzes();
        // Map Sanity data to Quiz interface
        const mappedQuizzes = data.map((q: any) => ({
          id: q._id,
          title: q.title,
          description: q.description,
          questionCount: q.questionCount,
          emoji: q.emoji,
          coverImage: q.coverImage,
          slug: q.slug,
        }));
        setQuizzes(mappedQuizzes);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="mb-4 font-heading text-4xl font-black text-foreground md:text-5xl lg:text-6xl">
            Quizzes & Tools
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Quick quizzes to match you with the perfect cozy game for your mood. No sign-up required — just honest questions and personalised picks.
          </p>
        </motion.div>

        {/* Quizzes Grid */}
        <motion.div
          variants={sectionVariant}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted/40" />
              ))}
            </div>
          ) : quizzes.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quizzes.map((quiz: any) => (
                <a key={quiz.id} href={`/quizzes/${quiz.slug?.current || quiz.id}`}>
                  <QuizCard quiz={quiz} />
                </a>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border/40 bg-card p-12 text-center">
              <p className="text-lg text-muted-foreground">
                No quizzes available yet. Check back soon!
              </p>
            </div>
          )}
        </motion.div>

        {/* Info Section */}
        <motion.div
          variants={sectionVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 rounded-2xl border border-border/40 bg-card p-8 md:p-10"
        >
          <h2 className="mb-4 font-heading text-xl font-bold text-foreground">
            Why Quizzes?
          </h2>
          <p className="mb-4 max-w-2xl leading-relaxed text-muted-foreground">
            Choosing what to play next can be overwhelming. There are hundreds of cozy games out there — which one matches your mood right now?
          </p>
          <p className="max-w-2xl leading-relaxed text-muted-foreground">
            These quizzes give you a quick, personalised recommendation without the noise. No fluff, no ads — just the right game for the right moment.
          </p>
        </motion.div>
      </main>

      <SiteFooter />
    </div>
  );
}
