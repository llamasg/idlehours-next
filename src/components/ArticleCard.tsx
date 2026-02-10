import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import type { Post } from "@/data/mock-data";

interface ArticleCardProps {
  post: Post;
}

const ArticleCard = ({ post }: ArticleCardProps) => {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="flex w-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
    >
      {/* Thumbnail */}
      <div className="aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-secondary via-card to-secondary">
        {post.coverImageUrl && (
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <Badge className="mb-2 w-fit rounded-full bg-primary/20 px-2.5 py-0.5 font-heading text-[10px] font-bold uppercase tracking-widest text-primary">
          {post.category}
        </Badge>

        <h3 className="mb-1.5 font-heading text-sm font-bold leading-snug text-foreground line-clamp-2">
          {post.title}
        </h3>

        <p className="mb-3 text-xs leading-relaxed text-muted-foreground line-clamp-2">
          {post.excerpt}
        </p>

        <p className="mt-auto text-[11px] text-muted-foreground">
          {post.readingTime} min · {post.category}
        </p>
      </div>
    </motion.article>
  );
};

export default ArticleCard;
