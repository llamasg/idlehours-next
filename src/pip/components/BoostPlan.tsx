/* ──────────────────────────────────────────────
   Pip Dashboard v2 — BoostPlan
   Renders a generated growth plan inline.
   Designed for dark (#1C1C1E) background context.
   ────────────────────────────────────────────── */

import { motion } from 'framer-motion';
import type { BoostPlan as BoostPlanType } from '../lib/pipMockData';

interface BoostPlanProps {
  plan: BoostPlanType;
  onSave: () => void;
}

const effortStyles = {
  low:    'bg-green-900/50 text-green-400',
  medium: 'bg-amber-900/50 text-amber-400',
  high:   'bg-red-900/50 text-red-400',
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
      <div className="space-y-5 pt-2">

        {/* Headline */}
        <div>
          <h2 className="text-xl font-bold text-white">
            🚀 {plan.headline}
          </h2>
          <p className="mt-1 text-sm text-white/50">🎯 {plan.target}</p>
        </div>

        {/* Honest assessment */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">
            Honest assessment
          </p>
          <p className="text-sm text-white/80 leading-relaxed italic">
            {plan.honestAssessment}
          </p>
        </div>

        {/* Week sections */}
        {plan.weeks.map((week, idx) => (
          <div key={idx} className="rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="font-semibold text-sm text-white">{week.weekRange}</span>
              <span className="text-xs text-white/40 italic">{week.focus}</span>
            </div>
            <div className="space-y-2">
              {week.tasks.map((t, tIdx) => (
                <div key={tIdx} className="flex gap-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 h-fit mt-0.5 font-medium ${effortStyles[t.effort]}`}
                  >
                    {t.effort}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">{t.task}</p>
                    <p className="text-xs text-white/50 mt-0.5">{t.why}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Big Bet */}
        <div className="rounded-xl bg-[#7C9B7A]/20 border border-[#7C9B7A]/30 p-4">
          <p className="text-xs font-bold text-[#7C9B7A] uppercase tracking-wider mb-2">
            Big bet
          </p>
          <p className="text-sm text-white/80">{plan.bigBet}</p>
        </div>

        {/* Pip's note */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">
            From Pip
          </p>
          <p className="text-sm text-white/70 leading-relaxed italic">"{plan.pipNote}"</p>
        </div>

        {/* Save button — hidden via onSave no-op when auto-saved */}
        <button
          onClick={onSave}
          className="text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          Saved automatically ✓
        </button>

      </div>
    </motion.div>
  );
}
