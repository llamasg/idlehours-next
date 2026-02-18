/* ──────────────────────────────────────────────
   Pip Dashboard v2 — PipSpeech
   Robot avatar + animated speech bubble
   ────────────────────────────────────────────── */

import { motion } from 'framer-motion';

interface PipSpeechProps {
  message: string;
  className?: string;
}

export function PipSpeech({ message, className = '' }: PipSpeechProps) {
  return (
    <motion.div
      className={`flex items-start gap-3 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Avatar */}
      <span className="mt-1 text-2xl select-none" aria-hidden="true">
        🤖
      </span>

      {/* Speech bubble */}
      <div className="bg-white border border-border rounded-2xl rounded-tl-sm p-4 shadow-sm">
        <p className="text-stone-700 leading-relaxed">{message}</p>
      </div>
    </motion.div>
  );
}
