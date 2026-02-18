/* ──────────────────────────────────────────────
   Pip Dashboard v2 — PipGoals (Goals View)
   Goal tracking + Boost plan generation
   ────────────────────────────────────────────── */

import { motion } from 'framer-motion';

import { usePipData } from '@/pip/hooks/usePipData';
import { useBoostPlan } from '@/pip/hooks/useBoostPlan';
import { GoalTracker } from '@/pip/components/GoalTracker';
import { BoostPlanView } from '@/pip/components/BoostPlan';
import type { BoostContext } from '@/pip/lib/pipMockData';

/* ── bouncing dots loader ────────────────────── */

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 py-4">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block h-2.5 w-2.5 rounded-full bg-burnt-orange"
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ── main component ──────────────────────────── */

export default function PipGoals() {
  const { goals, analytics, clusters, streak } = usePipData();
  const { plan, isGenerating, generate, save } = useBoostPlan();

  if (!goals) return <div className="py-8 px-4 text-muted-foreground">Loading...</div>;

  /* Build BoostContext from live data */
  const activeCluster = clusters.find((c) =>
    c.steps.some((s) => s.status !== 'published'),
  );
  const clusterPublished = activeCluster
    ? activeCluster.steps.filter((s) => s.status === 'published').length
    : 0;
  const clusterTotal = activeCluster ? activeCluster.steps.length : 0;

  const topPost = analytics.topPosts[0] ?? { title: 'None yet', sessions: 0 };
  const quickWin = analytics.search.quickWins[0] ?? { query: 'None yet', position: 0 };

  const boostContext: BoostContext = {
    sessions: analytics.overview.sessions7d,
    sessionsDelta: analytics.overview.sessionsDelta,
    totalPosts: analytics.topPosts.length,
    activeCluster: activeCluster?.name ?? 'None',
    clusterProgress: clusterPublished,
    clusterTotal,
    streak,
    topPost: { title: topPost.title, sessions: topPost.sessions },
    quickWin: { query: quickWin.query, position: quickWin.position },
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-8 px-4">
      {/* Heading */}
      <motion.h1
        className="text-3xl font-bold text-stone-900"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        The Big Picture
      </motion.h1>

      {/* Goal tracker */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <GoalTracker goal={goals} />
      </motion.div>

      {/* Boost section */}
      <motion.div
        className="mt-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="rounded-2xl bg-brand-dark p-6 text-white">
          <h2 className="text-xl font-semibold">
            {'\uD83D\uDE80'} Things feeling slow?
          </h2>
          <p className="mt-2 text-white/70">
            Let Pip analyse your analytics, clusters, and search data to build a
            personalised sprint plan that moves the needle.
          </p>

          {!plan && !isGenerating && (
            <motion.button
              onClick={() => generate(boostContext)}
              className="mt-4 rounded-full bg-burnt-orange px-8 py-3 font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:shadow-burnt-orange/25"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Generate my boost plan →
            </motion.button>
          )}

          {isGenerating && <ThinkingDots />}
        </div>

        {/* Rendered plan */}
        {plan && (
          <div className="mt-6">
            <BoostPlanView plan={plan} onSave={save} />
          </div>
        )}
      </motion.div>
    </div>
  );
}
