import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface MoodTile {
  title: string;
  slug: string;
  bg: string;
  textClass: string;
  icon: string;
  sub: string;
  tags: string[];
}

const tiles: MoodTile[] = [
  {
    title: "Low energy day",
    slug: "low-energy",
    bg: "bg-accent-green/10",
    textClass: "text-foreground",
    icon: "🌧️",
    sub: "No challenge required. Just vibe.",
    tags: ["anxiety-friendly", "no-combat", "short sessions"],
  },
  {
    title: "I want to get absorbed",
    slug: "absorbed",
    bg: "bg-teal",
    textClass: "text-white",
    icon: "🌀",
    sub: "One more run. One more day. One more...",
    tags: ["one-more-run", "Balatro", "roguelikes"],
  },
  {
    title: "Play something with me",
    slug: "co-op",
    bg: "bg-burnt-orange/10",
    textClass: "text-foreground",
    icon: "🎮",
    sub: "Co-op and multiplayer picks.",
    tags: ["co-op", "couch", "online"],
  },
  {
    title: "I want a challenge (but kindly)",
    slug: "challenge",
    bg: "bg-brand-dark",
    textClass: "text-white",
    icon: "⛰️",
    sub: "Celeste. Cairn. Hard games with gentle souls.",
    tags: ["meditative-challenge", "forgiving", "great-soundtrack"],
  },
];

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

const MoodTiles = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-12 py-20">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Find your next game by mood
        </h2>
        <p className="text-muted-foreground mt-2 mb-10">
          Not sure what you're in the mood for? Start here.
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        {tiles.map((tile) => (
          <motion.div key={tile.slug} variants={item}>
            <Link to={`/mood/${tile.slug}`}>
              <motion.div
                className={`${tile.bg} ${tile.textClass} rounded-2xl p-8 transition-shadow`}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-3xl block mb-3">{tile.icon}</span>
                <h3 className="text-xl font-bold mb-1">{tile.title}</h3>
                <p className="text-sm opacity-80 mb-4">{tile.sub}</p>
                <div className="flex flex-wrap gap-2">
                  {tile.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`text-xs px-2 py-1 rounded-full ${
                        tile.textClass === "text-white"
                          ? "bg-white/15 text-white/90"
                          : "bg-black/5 text-muted-foreground"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default MoodTiles;
