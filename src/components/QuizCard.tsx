import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface QuizCardProps {
  quiz: {
    _id?: string;
    id?: string;
    title: string;
    description: string;
    questionCount: number;
    emoji: string;
    coverImage?: string;
  };
}

const QuizCard = ({ quiz }: QuizCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 8px 30px hsl(210 100% 50% / 0.15)" }}
      transition={{ duration: 0.2 }}
      className="flex w-60 flex-shrink-0 cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/40 bg-card md:w-64"
    >
      {/* Cover Image or Emoji */}
      {quiz.coverImage ? (
        <div className="aspect-[16/10] w-full bg-gradient-to-br from-secondary via-card to-secondary">
          <img
            src={quiz.coverImage}
            alt={quiz.title}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex aspect-[16/10] w-full items-center justify-center bg-gradient-to-br from-secondary via-card to-secondary">
          <span className="text-6xl">{quiz.emoji}</span>
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <Badge className="mb-2 w-fit rounded-full bg-primary/20 px-2.5 py-0.5 font-heading text-[10px] font-bold uppercase tracking-widest text-primary">
          Quiz
        </Badge>

        <h3 className="mb-1.5 font-heading text-sm font-bold leading-snug text-foreground">
          {quiz.title}
        </h3>

        <p className="mb-3 text-xs leading-relaxed text-muted-foreground line-clamp-2">
          {quiz.description}
        </p>

        <p className="mt-auto text-[11px] text-muted-foreground">
          {quiz.questionCount} questions
        </p>
      </div>
    </motion.div>
  );
};

export default QuizCard;
