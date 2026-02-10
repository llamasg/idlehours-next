import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, RotateCcw, Share2 } from "lucide-react";
import { getQuiz } from "@/lib/queries";

interface QuizData {
  _id: string;
  title: string;
  description: string;
  emoji: string;
  questions: Array<{
    question: string;
    answers: string[];
    resultWeights?: any;
  }>;
  results: Array<{
    resultType: string;
    title: string;
    description: string;
    recommendedPosts?: any[];
    recommendedProducts?: any[];
  }>;
}

export default function QuizPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!slug) return;
      try {
        const data = await getQuiz(slug);
        setQuiz(data);

        // Check if there's a result in URL
        const urlResult = searchParams.get("result");
        if (urlResult && data) {
          const foundResult = data.results.find((r: any) => r.resultType === urlResult);
          if (foundResult) {
            setResult(foundResult);
            setQuizCompleted(true);
            setQuizStarted(true);
          }
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [slug, searchParams]);

  const handleStart = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setAnswers([]);
    setQuizCompleted(false);
    setResult(null);
  };

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);

    // Auto-advance to next question
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    } else {
      // Calculate result
      setTimeout(() => {
        calculateResult(newAnswers);
      }, 300);
    }
  };

  const calculateResult = (finalAnswers: number[]) => {
    if (!quiz) return;

    // Simple scoring: count most common result type
    const scores: Record<string, number> = {};
    quiz.results.forEach((r: any) => {
      scores[r.resultType] = 0;
    });

    // For demo, use a simple random-ish algorithm based on answers
    const answerSum = finalAnswers.reduce((a, b) => a + b, 0);
    const resultIndex = answerSum % quiz.results.length;
    const calculatedResult = quiz.results[resultIndex];

    setResult(calculatedResult);
    setQuizCompleted(true);

    // Save to localStorage
    localStorage.setItem(`quiz-result-${quiz._id}`, calculatedResult.resultType);
  };

  const handleShare = () => {
    if (!result || !quiz) return;
    const url = `${window.location.origin}/quizzes/${slug}?result=${result.resultType}`;
    navigator.clipboard.writeText(url);
    alert("Result link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-12">
          <div className="h-96 animate-pulse rounded-3xl bg-muted/40" />
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-20 text-center">
          <h1 className="mb-4 font-heading text-3xl font-bold text-foreground">Quiz Not Found</h1>
          <p className="text-muted-foreground">This quiz doesn't exist or has been removed.</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // Intro Screen
  if (!quizStarted || quizCompleted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        <main className="mx-auto max-w-4xl px-4 py-12 lg:py-16">
          <AnimatePresence mode="wait">
            {!quizCompleted ? (
              // Intro
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="rounded-3xl border border-border/40 bg-card p-8 text-center md:p-12"
              >
                <div className="mb-6 text-6xl">{quiz.emoji}</div>
                <Badge className="mb-4 rounded-full bg-primary/20 px-4 py-1 font-heading text-xs font-bold uppercase tracking-widest text-primary">
                  Quiz
                </Badge>
                <h1 className="mb-4 font-heading text-3xl font-black text-foreground md:text-4xl">
                  {quiz.title}
                </h1>
                <p className="mb-8 text-lg text-muted-foreground">{quiz.description}</p>
                <p className="mb-6 text-sm text-muted-foreground">
                  {quiz.questions.length} questions • ~2 minutes
                </p>
                <Button
                  onClick={handleStart}
                  className="rounded-full px-8 py-6 font-heading text-sm uppercase tracking-wider"
                >
                  Start Quiz
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            ) : (
              // Results
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <div className="rounded-3xl border border-border/40 bg-card p-8 md:p-12">
                  <Badge className="mb-4 rounded-full bg-primary/20 px-4 py-1 font-heading text-xs font-bold uppercase tracking-widest text-primary">
                    Your Result
                  </Badge>
                  <h2 className="mb-4 font-heading text-3xl font-black text-foreground md:text-4xl">
                    {result.title}
                  </h2>
                  <p className="mb-8 leading-relaxed text-muted-foreground">{result.description}</p>

                  <div className="flex flex-wrap gap-3">
                    <Button onClick={handleStart} variant="outline" className="rounded-full">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Retake Quiz
                    </Button>
                    <Button onClick={handleShare} variant="outline" className="rounded-full">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Result
                    </Button>
                  </div>
                </div>

                <div className="text-center">
                  <a
                    href="/quizzes"
                    className="text-sm text-primary transition-colors hover:text-primary/80 hover:underline"
                  >
                    ← Back to all quizzes
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <SiteFooter />
      </div>
    );
  }

  // Quiz Questions
  const currentQ = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-12 lg:py-16">
        {/* Progress */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
            <span className="text-primary">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted/40">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              className="h-full rounded-full bg-primary"
            />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h2 className="mb-8 font-heading text-2xl font-bold text-foreground md:text-3xl">
              {currentQ.question}
            </h2>

            <div className="space-y-3">
              {currentQ.answers.map((answer, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full rounded-xl border border-border/40 bg-card p-4 text-left transition-all hover:border-primary/40 hover:bg-secondary ${
                    answers[currentQuestion] === index ? "border-primary bg-primary/10" : ""
                  }`}
                >
                  <p className="font-medium text-foreground">{answer}</p>
                </motion.button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button
                variant="ghost"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="rounded-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button variant="ghost" onClick={() => setQuizStarted(false)} className="rounded-full">
                Exit Quiz
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <SiteFooter />
    </div>
  );
}
