import { motion } from "framer-motion";
import { Link } from "react-router-dom";

/* ------------------------------------------------------------------ */
/*  CSS-only firefly data – random positions, sizes, and anim timings */
/* ------------------------------------------------------------------ */
interface Firefly {
  id: number;
  top: string;
  left: string;
  size: number;
  color: string;
  floatDuration: string;
  floatDelay: string;
  pulseDuration: string;
  pulseDelay: string;
}

const fireflies: Firefly[] = [
  { id: 1, top: "12%", left: "8%", size: 3, color: "bg-white", floatDuration: "6s", floatDelay: "0s", pulseDuration: "4s", pulseDelay: "0.5s" },
  { id: 2, top: "25%", left: "72%", size: 2, color: "bg-accent-green", floatDuration: "5s", floatDelay: "1.2s", pulseDuration: "3.5s", pulseDelay: "0s" },
  { id: 3, top: "60%", left: "15%", size: 4, color: "bg-white", floatDuration: "7s", floatDelay: "0.8s", pulseDuration: "4.5s", pulseDelay: "1s" },
  { id: 4, top: "40%", left: "90%", size: 2, color: "bg-accent-green", floatDuration: "4.5s", floatDelay: "2s", pulseDuration: "3s", pulseDelay: "0.3s" },
  { id: 5, top: "78%", left: "55%", size: 3, color: "bg-white", floatDuration: "6.5s", floatDelay: "0.4s", pulseDuration: "5s", pulseDelay: "1.5s" },
  { id: 6, top: "18%", left: "40%", size: 2, color: "bg-accent-green", floatDuration: "5.5s", floatDelay: "1.8s", pulseDuration: "3.8s", pulseDelay: "0.7s" },
  { id: 7, top: "85%", left: "25%", size: 3, color: "bg-white", floatDuration: "7.5s", floatDelay: "0.2s", pulseDuration: "4.2s", pulseDelay: "2s" },
  { id: 8, top: "50%", left: "82%", size: 2, color: "bg-accent-green", floatDuration: "4s", floatDelay: "1.5s", pulseDuration: "3.2s", pulseDelay: "0.9s" },
  { id: 9, top: "35%", left: "5%", size: 4, color: "bg-white", floatDuration: "8s", floatDelay: "0.6s", pulseDuration: "4.8s", pulseDelay: "1.2s" },
  { id: 10, top: "70%", left: "65%", size: 2, color: "bg-accent-green", floatDuration: "5.2s", floatDelay: "2.5s", pulseDuration: "3.6s", pulseDelay: "0.4s" },
  { id: 11, top: "8%", left: "52%", size: 3, color: "bg-white", floatDuration: "6.8s", floatDelay: "1s", pulseDuration: "4.4s", pulseDelay: "1.8s" },
  { id: 12, top: "92%", left: "35%", size: 2, color: "bg-accent-green", floatDuration: "4.8s", floatDelay: "0.3s", pulseDuration: "3.4s", pulseDelay: "0.6s" },
  { id: 13, top: "55%", left: "48%", size: 3, color: "bg-white", floatDuration: "7.2s", floatDelay: "1.6s", pulseDuration: "5s", pulseDelay: "1.4s" },
  { id: 14, top: "30%", left: "28%", size: 2, color: "bg-accent-green", floatDuration: "5.8s", floatDelay: "2.2s", pulseDuration: "3.8s", pulseDelay: "0.2s" },
];

/* ------------------------------------------------------------------ */
/*  Framer Motion helpers                                              */
/* ------------------------------------------------------------------ */
const fadeUp = (index: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.2 * index, duration: 0.6 },
});

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function Hero() {
  return (
    <motion.section
      className="relative w-full min-h-[85vh] flex items-center bg-gradient-to-br from-[#0a1f1a] via-[#1e1a14] to-[#0d2818]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* ---- Fireflies ---- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {fireflies.map((f) => (
          <div
            key={f.id}
            className={`absolute rounded-full ${f.color}`}
            style={{
              top: f.top,
              left: f.left,
              width: f.size,
              height: f.size,
              opacity: 0.2,
              animation: `fireflyFloat ${f.floatDuration} ${f.floatDelay} ease-in-out infinite alternate, fireflyPulse ${f.pulseDuration} ${f.pulseDelay} ease-in-out infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* ---- Keyframes (injected once via <style>) ---- */}
      <style>{`
        @keyframes fireflyFloat {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-18px); }
        }
        @keyframes fireflyPulse {
          0%   { opacity: 0.2; }
          100% { opacity: 0.6; }
        }
      `}</style>

      {/* ---- Content ---- */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full">
        <div className="lg:max-w-[60%]">
          {/* Eyebrow pill */}
          <motion.div {...fadeUp(0)}>
            <span className="inline-block bg-brand-green text-white text-sm font-semibold rounded-full px-4 py-1.5 mb-6">
              🌿 Updated daily
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            {...fadeUp(1)}
            className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white mb-6"
          >
            For the hours you didn't plan
            <br />
            to spend — and didn't want to end
          </motion.h1>

          {/* Subheading */}
          <motion.p
            {...fadeUp(2)}
            className="text-lg text-white/70 max-w-xl mb-8"
          >
            Games that are absorbing, forgiving, and made by people who love the
            medium. Not just cosy. Just genuinely good.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            {...fadeUp(3)}
            className="flex flex-wrap gap-4 mb-8"
          >
            <Link
              to="/games"
              className="bg-burnt-orange text-white rounded-full px-6 py-3 font-semibold hover:brightness-110 transition-all"
            >
              Browse Games
            </Link>
            <Link
              to="/quizzes"
              className="border border-white/40 text-white rounded-full px-6 py-3 hover:bg-white/10 transition-all"
            >
              Find a game for my mood →
            </Link>
          </motion.div>

          {/* Micro-badges */}
          <motion.div
            {...fadeUp(4)}
            className="flex flex-wrap gap-2 text-sm text-white/50"
          >
            <span>🕐 Not just "cosy"</span>
            <span>·</span>
            <span>🎮 Made with love</span>
            <span>·</span>
            <span>🎵 Soundtracks matter</span>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
