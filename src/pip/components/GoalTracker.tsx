'use client'
/* ──────────────────────────────────────────────
   Pip Dashboard v2 — GoalTracker
   Animated goal progress card with milestones
   ────────────────────────────────────────────── */

import { motion } from 'framer-motion';

interface GoalTrackerProps {
  goal: {
    title: string;
    current: number;
    target: number;
    milestones: number[];
  };
}

export function GoalTracker({ goal }: GoalTrackerProps) {
  const pct = Math.min((goal.current / goal.target) * 100, 100);

  return (
    <div className="rounded-2xl bg-brand-dark p-6 text-white">
      {/* Title */}
      <h2 className="text-xl font-semibold">{goal.title}</h2>

      {/* Current / Target */}
      <p className="mt-2 text-white/70">
        <span className="text-2xl font-bold text-white">
          {goal.current.toLocaleString()}
        </span>{' '}
        / {goal.target.toLocaleString()} sessions per week
      </p>

      {/* Progress bar */}
      <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/20">
        <motion.div
          className="h-full rounded-full bg-burnt-orange"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {/* Percentage */}
      <p className="mt-1 text-right text-sm text-white/60">
        {Math.round(pct)}%
      </p>

      {/* Milestones */}
      <div className="mt-4 flex flex-wrap gap-2">
        {goal.milestones.map((ms) => {
          const reached = goal.current >= ms;
          const firstUnreached = goal.milestones.find((m) => goal.current < m);
          const isNextMilestone = !reached && ms === firstUnreached;

          if (reached) {
            return (
              <span
                key={ms}
                className="rounded-full bg-accent-green px-3 py-1 text-xs font-medium text-white"
              >
                {ms.toLocaleString()}
              </span>
            );
          }

          if (isNextMilestone) {
            return (
              <span
                key={ms}
                className="rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs font-medium text-white"
              >
                {'\uD83D\uDD1C'} {ms.toLocaleString()}
              </span>
            );
          }

          return (
            <span
              key={ms}
              className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/40"
            >
              {ms.toLocaleString()}
            </span>
          );
        })}
      </div>
    </div>
  );
}
