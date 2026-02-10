import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HorizontalLaneProps {
  title: string;
  children: React.ReactNode;
}

const HorizontalLane = ({ title, children }: HorizontalLaneProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold uppercase tracking-wider text-foreground md:text-xl">
          {title}
        </h2>
        <div className="hidden gap-2 md:flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll("left")}
            className="h-8 w-8 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll("right")}
            className="h-8 w-8 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-hide flex gap-4 overflow-x-auto pb-2"
      >
        {children}
      </div>
    </section>
  );
};

export default HorizontalLane;
