/* ──────────────────────────────────────────────
   Pip Dashboard v2 — BoostPlan
   Renders a generated growth plan inline
   ────────────────────────────────────────────── */

import { motion } from 'framer-motion';
import type { BoostPlan as BoostPlanType } from '../lib/pipMockData';

interface BoostPlanProps {
  plan: BoostPlanType;
  onSave: () => void;
}

const effortStyles = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
} as const;

export function BoostPlanView({ plan, onSave }: BoostPlanProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="overflow-hidden"
    >
      <div className="space-y-6 pt-2">
        {/* Headline */}
        <h2 className="text-2xl font-bold text-stone-900">
          {'\uD83D\uDE80'} {plan.headline}
        </h2>

        {/* Target */}
        <p className="text-muted-foreground">Target: {plan.target}</p>

        {/* Honest assessment */}
        <div>
          <p className="text-sm font-semibold text-stone-700">
            Pip's honest take:
          </p>
          <div className="mt-2 rounded-xl bg-muted p-4 italic text-stone-700">
            {plan.honestAssessment}
          </div>
        </div>

        {/* Week sections */}
        {plan.weeks.map((week, idx) => (
          <div key={idx}>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-stone-900">
                {week.weekRange}
              </h3>
              <div className="h-px flex-1 bg-stone-200" />
            </div>

            <p className="mt-1 italic text-muted-foreground">{week.focus}</p>

            <div className="mt-3 space-y-2">
              {week.tasks.map((t, tIdx) => (
                <div
                  key={tIdx}
                  className="rounded-xl bg-white p-4 shadow-sm"
                >
                  <p className="font-medium text-stone-900">{t.task}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Why: {t.why}
                  </p>
                  <span
                    className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${effortStyles[t.effort]}`}
                  >
                    {t.effort} effort
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Big Bet */}
        <div>
          <h3 className="text-lg font-semibold text-stone-900">
            {'\uD83C\uDFAF'} The Big Bet
          </h3>
          <div className="mt-2 rounded-r-xl border-l-4 border-burnt-orange bg-burnt-orange/5 p-4 text-stone-800">
            {plan.bigBet}
          </div>
        </div>

        {/* Pip's note */}
        <div>
          <h3 className="text-lg font-semibold text-stone-900">
            {'\uD83D\uDC8C'} Pip's note
          </h3>
          <div className="mt-2 rounded-r-xl border-l-4 border-accent-green bg-accent-green/5 p-4 italic text-stone-800">
            {plan.pipNote}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={onSave}
          className="rounded-full bg-burnt-orange px-6 py-3 font-semibold text-white transition-transform hover:scale-105"
        >
          Save this plan
        </button>
      </div>
    </motion.div>
  );
}
