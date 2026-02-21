'use client'
/* ──────────────────────────────────────────────
   Pip Dashboard v2 — StatCard
   Small stat display with optional delta indicator
   ────────────────────────────────────────────── */

import type { LucideIcon } from 'lucide-react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  delta?: number;
  icon?: LucideIcon;
}

export function StatCard({ label, value, delta, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      {/* Icon */}
      {Icon && (
        <div className="mb-2">
          <Icon className="h-4 w-4 text-stone-400" />
        </div>
      )}

      {/* Value */}
      <p className="text-2xl font-bold text-stone-900">{value}</p>

      {/* Label + Delta */}
      <div className="mt-1 flex items-center gap-2">
        <span className="text-sm text-stone-500">{label}</span>

        {delta !== undefined && delta !== 0 && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-medium ${
              delta > 0 ? 'text-emerald-600' : 'text-red-500'
            }`}
          >
            {delta > 0 ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
    </div>
  );
}
