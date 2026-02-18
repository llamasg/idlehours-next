/* ──────────────────────────────────────────────
   Pip Dashboard v2 — PipAchievements (Badges View)
   Achievement cards with earned / locked states
   ────────────────────────────────────────────── */

import { motion } from 'framer-motion';

import { usePipData } from '@/pip/hooks/usePipData';
import type { PipAchievement } from '@/pip/lib/pipMockData';

/* ── card component ──────────────────────────── */

function AchievementCard({
  achievement,
  index,
}: {
  achievement: PipAchievement;
  index: number;
}) {
  const { earned } = achievement;

  return (
    <motion.div
      className={`
        relative rounded-xl border p-5 text-center transition-shadow
        ${
          earned
            ? 'border-border bg-white ring-2 ring-amber-300 hover:shadow-md'
            : 'border-border bg-stone-50'
        }
      `}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={earned ? { y: -2 } : undefined}
    >
      {/* Corner badge */}
      <span
        className={`absolute top-2 right-2 text-xs font-medium ${
          earned ? 'text-green-600' : 'text-stone-400'
        }`}
      >
        {earned ? '\u2705 Earned' : '\uD83D\uDD12 Locked'}
      </span>

      {/* Emoji */}
      <div
        className="text-4xl leading-none"
        style={earned ? undefined : { filter: 'grayscale(1)' }}
      >
        {achievement.emoji}
      </div>

      {/* Name */}
      <p
        className={`mt-2 text-base font-semibold ${
          earned ? 'text-stone-900' : 'text-stone-900 opacity-50'
        }`}
      >
        {achievement.name}
      </p>

      {/* Description */}
      <p
        className={`mt-1 text-sm ${
          earned ? 'text-muted-foreground' : 'text-muted-foreground opacity-50'
        }`}
      >
        {achievement.description}
      </p>
    </motion.div>
  );
}

/* ── main component ──────────────────────────── */

export default function PipAchievements() {
  const { achievements } = usePipData();

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-8 px-4">
      {/* Heading */}
      <motion.h1
        className="text-3xl font-bold text-stone-900"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        Achievements
      </motion.h1>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {achievements.map((ach, i) => (
          <AchievementCard key={ach.id} achievement={ach} index={i} />
        ))}
      </div>
    </div>
  );
}
