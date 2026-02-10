import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import GlareHover from "@/components/GlareHover";

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
    <GlareHover
      width="100%"
      height="100%"
      background="hsl(var(--card))"
      borderRadius="1rem"
      borderColor="hsl(var(--border))"
      glareColor="#ED850F"
      glareOpacity={0.12}
      glareAngle={-30}
      glareSize={300}
      transitionDuration={800}
      playOnce={false}
    >
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="flex w-full cursor-pointer flex-col overflow-hidden"
      >
        {/* Cover Image or Emoji */}
        {quiz.coverImage ? (
          <div className="aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-secondary via-card to-secondary">
            <img
              src={quiz.coverImage}
              alt={quiz.title}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-secondary via-card to-secondary">
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
    </GlareHover>
  );
};

export default QuizCard;
