import { motion } from "framer-motion";

const columns = [
  {
    icon: "🕐",
    heading: "Not just cosy",
    body: "We cover Balatro. We cover Celeste. We cover Cairn. If a game gives you idle hours, it belongs here — regardless of aesthetic.",
  },
  {
    icon: "🛡️",
    heading: "Games that respect you",
    body: "No FOMO mechanics. No pay-to-win. Every game we cover passes one test: can you set it down without being punished for it?",
  },
  {
    icon: "🎵",
    heading: "It's about the feeling",
    body: "The best idle hours feel like the music is still playing after you've closed the laptop. We look for that quality in everything.",
  },
];

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const PhilosophyStrip = () => {
  return (
    <section className="bg-white">
      <motion.div
        className="max-w-7xl mx-auto py-20 px-6 md:px-12"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {columns.map((col) => (
            <motion.div
              key={col.heading}
              variants={item}
              className="border-l-4 border-brand-green pl-6"
            >
              <span className="text-2xl block mb-3">{col.icon}</span>
              <h3 className="text-lg font-bold text-foreground mb-2">
                {col.heading}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {col.body}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default PhilosophyStrip;
