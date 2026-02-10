import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "@/data/mock-data";

interface ProductCardProps {
  product: Product;
}

const badgeColors: Record<string, string> = {
  Handmade: "bg-primary/20 text-primary",
  "Best For Display": "bg-accent/20 text-accent",
  Budget: "bg-muted text-muted-foreground",
};

const ProductCard = ({ product }: ProductCardProps) => {
  const imageUrl = product.image || (product as any).imageUrl;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="flex w-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
    >
      {/* Product Image */}
      <div className="aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-secondary via-card to-secondary">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <Badge
          className={`mb-2 w-fit rounded-full px-2.5 py-0.5 font-heading text-[10px] font-bold uppercase tracking-widest ${badgeColors[product.badge] || "bg-muted text-muted-foreground"}`}
        >
          {product.badge}
        </Badge>

        <h3 className="mb-1 font-heading text-sm font-bold text-foreground">
          {product.name}
        </h3>

        <p className="mb-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
          {product.shortBlurb}
        </p>

        {product.priceNote && (
          <p className="mb-3 text-xs font-medium text-foreground/70">
            {product.priceNote}
          </p>
        )}

        <a
          href={product.etsyUrl}
          target="_blank"
          rel="sponsored nofollow noopener"
          className="mt-auto"
        >
          <Button
            variant="outline"
            size="sm"
            className="w-full rounded-full border-border/60 font-heading text-[10px] uppercase tracking-wider text-foreground hover:bg-secondary"
          >
            View on Etsy
            <ExternalLink className="ml-1.5 h-3 w-3" />
          </Button>
        </a>
      </div>
    </motion.div>
  );
};

export default ProductCard;
