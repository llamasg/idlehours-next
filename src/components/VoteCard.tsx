import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import type { PokemonNominee } from "@/types";

interface VoteCardProps {
  nominees: PokemonNominee[];
}

const VoteCard = ({ nominees: initialNominees }: VoteCardProps) => {
  const [voted, setVoted] = useState<string | null>(null);
  const [nominees, setNominees] = useState(initialNominees);

  const handleVote = (name: string) => {
    if (voted) return;
    setVoted(name);
    setNominees((prev) =>
      prev.map((n) => (n.name === name ? { ...n, votes: n.votes + 1 } : n))
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl border border-border/40 bg-card p-6"
    >
      <Badge className="mb-3 rounded-full bg-primary/20 px-3 py-1 font-heading text-[10px] font-bold uppercase tracking-widest text-primary">
        Pokémon of the Month
      </Badge>
      <h3 className="mb-1 font-heading text-lg font-bold text-foreground">
        February 2026
      </h3>
      <p className="mb-5 text-xs text-muted-foreground">
        Pick your favourite. One vote, no take-backs.
      </p>

      <div className="space-y-2">
        {nominees.map((nominee) => (
          <button
            key={nominee.name}
            onClick={() => handleVote(nominee.name)}
            disabled={voted !== null}
            className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              voted === nominee.name
                ? "bg-primary/20 text-primary"
                : "bg-muted/40 text-foreground hover:bg-secondary"
            } ${voted && voted !== nominee.name ? "opacity-50" : ""}`}
          >
            <span className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ background: `hsl(${nominee.typeColor})` }}
              />
              {nominee.name}
            </span>
            {voted === nominee.name && <Check className="h-4 w-4 text-primary" />}
          </button>
        ))}
      </div>

      <Button
        variant="outline"
        className="mt-5 w-full rounded-full border-border/60 font-heading text-xs uppercase tracking-wider text-foreground hover:bg-secondary"
      >
        View Results
      </Button>
    </motion.div>
  );
};

export default VoteCard;
