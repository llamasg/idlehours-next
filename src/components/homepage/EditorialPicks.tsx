import { motion } from "framer-motion";

interface Pick {
  name: string;
  note: string;
  tags: string[];
  badge: string | null;
  gradient: string;
}

const picks: Pick[] = [
  {
    name: "Balatro",
    note: "Not cosy by any definition. But you will not put it down. Friday night warning.",
    tags: ["PC", "one-more-run", "great-soundtrack"],
    badge: "🔥 This week's pick",
    gradient: "from-[#1e1a14] to-[#c95d0d]",
  },
  {
    name: "Celeste",
    note: "One of the hardest platformers made. Also one of the most compassionate games ever made. Both are true.",
    tags: ["PC", "Switch", "meditative-challenge"],
    badge: null,
    gradient: "from-[#2d6a4f] to-[#52b788]",
  },
  {
    name: "Stardew Valley",
    note: "The game most people mean when they say they want something cosy. It earns the reputation.",
    tags: ["PC", "Switch", "PS5", "Xbox", "Mobile", "idle-friendly"],
    badge: null,
    gradient: "from-[#52b788] to-[#137034]",
  },
  {
    name: "A Short Hike",
    note: "Two hours. Possibly the most complete two hours in games. Play it on a Sunday afternoon.",
    tags: ["PC", "Switch", "short-sessions"],
    badge: null,
    gradient: "from-[#137034] to-[#0a1f1a]",
  },
  {
    name: "Cairn",
    note: "Climbing but meditative. You can set it down mid-climb. The mountain waits.",
    tags: ["PC", "meditative-challenge", "no-combat"],
    badge: null,
    gradient: "from-[#1e1a14] to-[#2d6a4f]",
  },
];

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const EditorialPicks = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-12 py-20">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          This week's idle hours
        </h2>
        <p className="text-muted-foreground mt-2 mb-10">
          Hand-picked. Editor's note included.
        </p>
      </div>

      <motion.div
        className="flex gap-6 overflow-x-auto md:flex-wrap md:overflow-visible scrollbar-hide"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        {picks.map((pick) => (
          <motion.div
            key={pick.name}
            variants={item}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="min-w-[280px] md:min-w-0 md:w-[calc(20%-1.2rem)] flex-shrink-0"
          >
            {/* Image placeholder */}
            <div className="relative">
              <div
                className={`aspect-video rounded-xl bg-gradient-to-br ${pick.gradient}`}
              />
              {pick.badge && (
                <span className="absolute top-3 left-3 bg-burnt-orange text-white text-xs px-2 py-1 rounded-full">
                  {pick.badge}
                </span>
              )}
            </div>

            {/* Card content */}
            <h3 className="font-bold text-foreground mt-3">{pick.name}</h3>
            <p className="text-sm italic text-muted-foreground mt-1">
              {pick.note}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {pick.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] bg-muted/40 text-muted-foreground px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default EditorialPicks;
