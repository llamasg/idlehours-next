/* ──────────────────────────────────────────────
   Pip Dashboard v2 — XpBar
   Experience / level progress bar with named levels
   ────────────────────────────────────────────── */

import { getLevelInfo } from '../lib/pipMockData';

interface XpBarProps {
  xp: number;
  level?: number; // kept for backwards compat, computed from xp if not provided
}

export function XpBar({ xp }: XpBarProps) {
  const levelInfo = getLevelInfo(xp);

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-3">
        {/* Level badge */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
          {levelInfo.level}
        </div>

        {/* XP + level name */}
        <div className="min-w-0 flex-1">
          <span className="text-sm font-semibold text-stone-800">
            {xp.toLocaleString()} XP
          </span>
          <p className="text-xs text-stone-500">{levelInfo.name}</p>
        </div>

        <span className="shrink-0 text-xs text-stone-400">
          {levelInfo.xpToNextLevel > 0
            ? `${levelInfo.xpToNextLevel} to level ${levelInfo.level + 1}`
            : 'Max level!'}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-emerald-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
          style={{ width: `${levelInfo.progress}%` }}
        />
      </div>
    </div>
  );
}
