'use client'
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-12 lg:px-8 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <h1 className="font-heading text-4xl font-black text-foreground md:text-5xl">
              About Idle Hours
            </h1>
            <p className="text-xl text-muted-foreground">
              Gently obsessive since forever.
            </p>
          </div>

          <div className="space-y-6 rounded-2xl border border-border/40 bg-card p-6 md:p-10">
            <section className="space-y-4">
              <h2 className="font-heading text-2xl font-bold text-foreground">What We're About</h2>
              <p className="leading-relaxed text-muted-foreground">
                Idle Hours is a cozy game discovery hub for people who prefer their gaming calm,
                warm, and unhurried. We're not chasing esports rankings or AAA hype — we're here
                for the farming sims, the puzzle games, the "one more in-game day" moments that
                make you forget about the real world for a while.
              </p>
              <p className="leading-relaxed text-muted-foreground">
                We write honest reviews, curate game collections by mood and vibe, and build
                tools (like our mood quiz) to help you find your next favourite game without
                doomscrolling through endless storefronts.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-2xl font-bold text-foreground">Our Philosophy</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong className="text-foreground">Play for joy, not clout.</strong> We don't care about meta or competitive rankings.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong className="text-foreground">Games are self-care.</strong> The right game at the right time can genuinely help you unwind.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong className="text-foreground">No hype, no FOMO.</strong> Just honest takes and practical recommendations.</span>
                </li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-2xl font-bold text-foreground">What We Do</h2>
              <p className="leading-relaxed text-muted-foreground">
                Beyond editorial content, we curate the best cozy gaming gear — from quiet
                keyboards to warm desk lamps — because the setup matters as much as the game.
                When we link to products, it's because we actually use and believe in them.
              </p>
              <p className="leading-relaxed text-muted-foreground">
                We also build interactive tools like mood-based game quizzes, maintain a "Game of
                the Month" spotlight, and keep a growing library of cozy game ratings with our
                unique Cozy %, Brain Effort, and Snack Safe scores.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-heading text-2xl font-bold text-foreground">Our Ratings</h2>
              <p className="leading-relaxed text-muted-foreground">
                Every game we feature gets rated on three things that actually matter for cozy gaming:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong className="text-foreground">Cozy %</strong> — How relaxing is it, really? From gentle vibes to mildly stressful.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong className="text-foreground">Brain Effort</strong> — Low, Medium, or High. Because sometimes you just want to zone out.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong className="text-foreground">Snack Safe</strong> — Can you eat snacks while playing? (No frantic button mashing required.)</span>
                </li>
              </ul>
            </section>
          </div>
        </motion.div>
      </main>

      <SiteFooter />
    </div>
  );
}
