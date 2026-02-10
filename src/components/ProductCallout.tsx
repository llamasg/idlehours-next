import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface ProductCalloutProps {
  value: {
    product: {
      name: string;
      shortBlurb: string;
      etsyUrl: string;
      badge: string;
      priceNote?: string;
      image?: string;
    };
    verdict?: string;
    customBadge?: string;
  };
}

const ProductCallout = ({ value }: ProductCalloutProps) => {
  const { product, verdict, customBadge } = value;

  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-border/40 bg-card">
      {product.image && (
        <div className="aspect-[16/9] w-full bg-gradient-to-br from-secondary via-card to-secondary">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <div className="mb-3 flex items-start justify-between gap-3">
          <Badge className="rounded-full bg-primary/20 px-3 py-1 font-heading text-[10px] font-bold uppercase tracking-widest text-primary">
            {customBadge || product.badge}
          </Badge>
          {product.priceNote && (
            <span className="text-sm font-medium text-foreground">
              {product.priceNote}
            </span>
          )}
        </div>

        <h3 className="mb-2 font-heading text-xl font-bold text-foreground">
          {product.name}
        </h3>

        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          {product.shortBlurb}
        </p>

        {verdict && (
          <div className="mb-4 rounded-lg border-l-4 border-primary/40 bg-primary/5 p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-primary">
              Our Verdict
            </p>
            <p className="text-sm text-foreground">{verdict}</p>
          </div>
        )}

        <a
          href={product.etsyUrl}
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
        >
          <Button className="w-full rounded-full font-heading text-xs uppercase tracking-wider sm:w-auto">
            View on Etsy
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </a>
      </div>
    </div>
  );
};

export default ProductCallout;
