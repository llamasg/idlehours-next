import { Info } from "lucide-react";
import { Link } from "react-router-dom";

const DisclosureBanner = () => {
  return (
    <div className="my-8 rounded-xl border border-primary/30 bg-primary/5 p-4">
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 flex-shrink-0 text-primary" />
        <div className="flex-1">
          <p className="text-sm leading-relaxed text-foreground">
            <strong>Affiliate Disclosure:</strong> This post contains affiliate
            links. If you purchase through these links, we may earn a small
            commission at no extra cost to you.{" "}
            <Link
              to="/disclosure"
              className="text-primary underline hover:text-primary/80"
            >
              Learn more
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DisclosureBanner;
