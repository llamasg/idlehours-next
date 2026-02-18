import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const tags = ["95% Idle", "Brain effort: Low", "Snack Safe", "Co-op"];

const GameOfMonth = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-12 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left column — Image placeholder */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="aspect-video rounded-2xl bg-gradient-to-br from-[#52b788] to-[#2d6a4f] shadow-lg" />
        </motion.div>

        {/* Right column — Content */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
        >
          <span className="text-xs bg-burnt-orange/10 text-burnt-orange px-3 py-1 rounded-full font-semibold inline-block">
            🏆 Game of the Month — February 2026
          </span>

          <div className="flex flex-wrap gap-2 mt-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-accent-green/10 text-accent-green px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          <h2 className="text-3xl font-bold text-foreground mt-4">
            Stardew Valley
          </h2>

          <p className="text-muted-foreground mt-3 leading-relaxed">
            February belongs to Stardew Valley. With the 1.6 update still going
            strong, there's never been a better time to return to Pelican Town.
          </p>

          <Link
            to="/games/stardew-valley"
            className="text-brand-green font-semibold mt-6 inline-flex items-center gap-1 hover:underline"
          >
            Read our full write-up →
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default GameOfMonth;
