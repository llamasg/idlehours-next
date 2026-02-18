import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const dots = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  top: `${Math.round(Math.random() * 100)}%`,
  left: `${Math.round(Math.random() * 100)}%`,
  size: Math.random() > 0.5 ? 2 : 1,
  opacity: 0.05 + Math.random() * 0.05,
}));

const MoodQuizBanner = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full bg-brand-dark py-20 px-6 md:px-12 overflow-hidden"
    >
      {/* Background dots */}
      {dots.map((dot) => (
        <div
          key={dot.id}
          className="absolute rounded-full bg-white pointer-events-none"
          style={{
            top: dot.top,
            left: dot.left,
            width: dot.size,
            height: dot.size,
            opacity: dot.opacity,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative text-center max-w-2xl mx-auto">
        <div className="text-5xl mb-4">🎯</div>
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          Not sure what to play?
        </h2>
        <p className="text-white/60 mt-3 text-lg">
          Take our quick mood quiz and we'll match you with the perfect game for
          right now.
        </p>
        <Link
          to="/quizzes"
          className="bg-burnt-orange text-white rounded-full px-8 py-3.5 font-semibold text-lg mt-8 inline-block hover:opacity-90 transition-opacity"
        >
          🎯 Find my game
        </Link>
      </div>
    </motion.section>
  );
};

export default MoodQuizBanner;
