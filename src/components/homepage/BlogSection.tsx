import { motion } from "framer-motion";

interface Post {
  category: string;
  title: string;
  excerpt: string;
  gradient: string;
  readTime: number;
}

const posts: Post[] = [
  {
    category: "📋 List",
    title: "10 games to get you into platformers (ranked by how forgiving they are)",
    excerpt:
      "From A Short Hike to Celeste — every game on this list earns its place.",
    gradient: "from-[#1e1a14] to-[#c95d0d]",
    readTime: 8,
  },
  {
    category: "💭 Essay",
    title: "What Balatro taught me about why I stopped playing games",
    excerpt:
      "It took a poker roguelike to remind me what games are actually for.",
    gradient: "from-[#2d6a4f] to-[#137034]",
    readTime: 5,
  },
  {
    category: "🎮 Review",
    title: "Cairn review: the mountain doesn't punish you for taking a break",
    excerpt:
      "Challenging, meditative, and genuinely unlike anything else in its genre.",
    gradient: "from-[#137034] to-[#1e1a14]",
    readTime: 6,
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

const BlogSection = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-12 py-20">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          From the blog
        </h2>
        <p className="text-muted-foreground mt-2 mb-10">
          Essays, lists, and recommendations with an actual point of view.
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        {posts.map((post) => (
          <motion.article
            key={post.title}
            variants={item}
            className="group rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Gradient thumbnail */}
            <div className="overflow-hidden">
              <div
                className={`aspect-[4/3] bg-gradient-to-br ${post.gradient} group-hover:scale-105 transition-transform duration-500`}
              />
            </div>

            {/* Card content */}
            <div className="p-5">
              <span className="text-xs bg-brand-green/10 text-brand-green px-3 py-1 rounded-full font-semibold">
                {post.category}
              </span>

              <h3 className="font-bold text-foreground text-lg leading-snug mt-2">
                {post.title}
              </h3>

              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {post.excerpt}
              </p>

              <p className="text-xs text-muted-foreground mt-3">
                {post.readTime} min read
              </p>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
};

export default BlogSection;
