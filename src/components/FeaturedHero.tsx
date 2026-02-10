import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Post } from "@/data/mock-data";

interface FeaturedHeroProps {
  post: Post;
}

const FeaturedHero = ({ post }: FeaturedHeroProps) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl border border-border/40 bg-card"
    >
      {/* Image */}
      <div className="relative aspect-[21/9] w-full bg-gradient-to-br from-card via-secondary to-card md:aspect-[3/1]">
        {post.coverImageUrl && (
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
      </div>

      {/* Content overlay */}
      <div className="relative -mt-24 px-6 pb-8 md:-mt-32 md:px-10 md:pb-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Badge className="mb-3 rounded-full bg-primary px-3 py-1 font-heading text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
            {post.category}
          </Badge>

          <h1 className="mb-3 font-heading text-2xl font-black leading-tight text-foreground md:text-4xl lg:text-5xl">
            {post.title}
          </h1>

          <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {post.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link to={`/blog/${post.slug}`}>
              <Button className="rounded-full px-6 font-heading text-xs font-bold uppercase tracking-wider">
                Read Article
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            {post.readingTime} min read · {post.author}
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default FeaturedHero;
