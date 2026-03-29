import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  BookOpen, 
  Users, 
  RefreshCcw,
  PiggyBank,
  Target,
  Shield,
  Wallet
} from "lucide-react";

interface Question {
  id: string;
  textEn: string;
  textAr: string;
  options: {
    textEn: string;
    textAr: string;
    score: number;
  }[];
}

const questions: Question[] = [
  {
    id: "budget",
    textEn: "Do you track your monthly income and expenses?",
    textAr: "هل تتابع دخلك ومصاريفك الشهرية؟",
    options: [
      { textEn: "No, I don't track at all", textAr: "لا، لا أتابعها أبداً", score: 0 },
      { textEn: "Sometimes, not regularly", textAr: "أحياناً، ليس بانتظام", score: 1 },
      { textEn: "Yes, I track everything", textAr: "نعم، أتابع كل شيء", score: 2 }
    ]
  },
  {
    id: "savings",
    textEn: "What percentage of your income do you save monthly?",
    textAr: "ما نسبة دخلك التي تدخرها شهرياً؟",
    options: [
      { textEn: "Less than 5% or nothing", textAr: "أقل من 5% أو لا شيء", score: 0 },
      { textEn: "5-15%", textAr: "5-15%", score: 1 },
      { textEn: "More than 15%", textAr: "أكثر من 15%", score: 2 }
    ]
  },
  {
    id: "emergency",
    textEn: "Do you have an emergency fund (3-6 months of expenses)?",
    textAr: "هل لديك صندوق طوارئ (3-6 أشهر من المصاريف)؟",
    options: [
      { textEn: "No emergency fund", textAr: "لا يوجد صندوق طوارئ", score: 0 },
      { textEn: "Less than 3 months", textAr: "أقل من 3 أشهر", score: 1 },
      { textEn: "3 months or more", textAr: "3 أشهر أو أكثر", score: 2 }
    ]
  },
  {
    id: "debt",
    textEn: "How do you manage your debts and loans?",
    textAr: "كيف تدير ديونك وقروضك؟",
    options: [
      { textEn: "I often struggle with payments", textAr: "غالباً أواجه صعوبة في السداد", score: 0 },
      { textEn: "I manage but it's tight", textAr: "أستطيع لكن الأمر صعب", score: 1 },
      { textEn: "I have no debt or manage it well", textAr: "لا ديون لدي أو أديرها جيداً", score: 2 }
    ]
  },
  {
    id: "investment",
    textEn: "Do you invest your money for long-term growth?",
    textAr: "هل تستثمر أموالك للنمو طويل المدى؟",
    options: [
      { textEn: "I don't invest at all", textAr: "لا أستثمر أبداً", score: 0 },
      { textEn: "I'm thinking about it", textAr: "أفكر في الأمر", score: 1 },
      { textEn: "Yes, I actively invest", textAr: "نعم، أستثمر بنشاط", score: 2 }
    ]
  },
  {
    id: "goals",
    textEn: "Do you have clear financial goals for the next 5 years?",
    textAr: "هل لديك أهداف مالية واضحة للسنوات الخمس القادمة؟",
    options: [
      { textEn: "No specific goals", textAr: "لا أهداف محددة", score: 0 },
      { textEn: "Some vague ideas", textAr: "بعض الأفكار العامة", score: 1 },
      { textEn: "Yes, clear written goals", textAr: "نعم، أهداف واضحة ومكتوبة", score: 2 }
    ]
  }
];

type ResultTier = "foundation" | "building" | "growing";

interface Result {
  tier: ResultTier;
  score: number;
  maxScore: number;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  icon: typeof AlertTriangle;
  color: string;
  bgColor: string;
  recommendCourse: boolean;
  recommendConsult: boolean;
  courseReasonEn: string;
  courseReasonAr: string;
  consultReasonEn: string;
  consultReasonAr: string;
}

function getResult(score: number): Result {
  const maxScore = questions.length * 2;
  
  if (score <= 4) {
    return {
      tier: "foundation",
      score,
      maxScore,
      titleEn: "Building Your Foundation",
      titleAr: "بناء أساسك المالي",
      descEn: "You're at the starting point of your financial journey. With the right guidance, you can build strong money habits.",
      descAr: "أنت في بداية رحلتك المالية. مع التوجيه الصحيح، يمكنك بناء عادات مالية قوية.",
      icon: AlertTriangle,
      color: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
      recommendCourse: true,
      recommendConsult: true,
      courseReasonEn: "Start with our fundamentals course to learn budgeting and saving basics",
      courseReasonAr: "ابدأ بدورتنا الأساسية لتعلم أساسيات الميزانية والادخار",
      consultReasonEn: "A 1-on-1 session can help create a personalized action plan",
      consultReasonAr: "جلسة فردية يمكن أن تساعد في إنشاء خطة عمل مخصصة"
    };
  } else if (score <= 8) {
    return {
      tier: "building",
      score,
      maxScore,
      titleEn: "Building Stability",
      titleAr: "بناء الاستقرار",
      descEn: "You have some good habits in place. Now it's time to optimize and grow your wealth.",
      descAr: "لديك بعض العادات الجيدة. الآن حان الوقت لتحسين وتنمية ثروتك.",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      recommendCourse: true,
      recommendConsult: false,
      courseReasonEn: "Our intermediate course will help you level up your investment strategy",
      courseReasonAr: "دورتنا المتوسطة ستساعدك على تطوير استراتيجية الاستثمار",
      consultReasonEn: "Consider a consultation for advanced portfolio strategies",
      consultReasonAr: "فكر في استشارة لاستراتيجيات المحفظة المتقدمة"
    };
  } else {
    return {
      tier: "growing",
      score,
      maxScore,
      titleEn: "Ready to Grow",
      titleAr: "جاهز للنمو",
      descEn: "Excellent financial habits! You're ready to take your wealth to the next level.",
      descAr: "عادات مالية ممتازة! أنت جاهز لنقل ثروتك إلى المستوى التالي.",
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      recommendCourse: true,
      recommendConsult: true,
      courseReasonEn: "Explore advanced investment strategies in our premium courses",
      courseReasonAr: "استكشف استراتيجيات الاستثمار المتقدمة في دوراتنا المميزة",
      consultReasonEn: "A strategic consultation can accelerate your wealth growth",
      consultReasonAr: "استشارة استراتيجية يمكن أن تسرع نمو ثروتك"
    };
  }
}

export function FinancialHealthAssessment() {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
  const result = getResult(totalScore);

  const handleAnswer = (score: number) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: score }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleRestart = () => {
    setStarted(false);
    setCurrentIndex(0);
    setAnswers({});
    setShowResult(false);
  };

  const selectedAnswer = answers[currentQuestion?.id];

  return (
    <Card className="border-2 border-primary/20 shadow-xl overflow-hidden" data-testid="financial-assessment-card">
      <div className="h-2 bg-gradient-to-r from-primary to-primary/60" />
      
      <AnimatePresence mode="wait">
        {!started && !showResult && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-8 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-3">
              {isRtl ? "تقييم صحتك المالية" : "Financial Health Check"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {isRtl 
                ? "أجب على 6 أسئلة سريعة لمعرفة وضعك المالي واحصل على توصيات مخصصة"
                : "Answer 6 quick questions to understand your financial status and get personalized recommendations"}
            </p>
            <div className="flex items-center justify-center gap-6 mb-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <PiggyBank className="w-4 h-4" />
                {isRtl ? "ادخار" : "Savings"}
              </span>
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                {isRtl ? "أمان" : "Security"}
              </span>
              <span className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                {isRtl ? "أهداف" : "Goals"}
              </span>
            </div>
            <Button size="lg" onClick={() => setStarted(true)} data-testid="start-assessment-btn">
              {isRtl ? "ابدأ التقييم" : "Start Assessment"}
              <ChevronRight className={cn("w-4 h-4", isRtl ? "rotate-180 mr-2" : "ml-2")} />
            </Button>
          </motion.div>
        )}

        {started && !showResult && (
          <motion.div
            key={`question-${currentIndex}`}
            initial={{ opacity: 0, x: isRtl ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRtl ? 50 : -50 }}
            className="p-6"
          >
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>{isRtl ? `سؤال ${currentIndex + 1} من ${questions.length}` : `Question ${currentIndex + 1} of ${questions.length}`}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <h4 className="text-lg font-semibold mb-6">
              {isRtl ? currentQuestion.textAr : currentQuestion.textEn}
            </h4>

            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option.score)}
                  className={cn(
                    "w-full p-4 rounded-lg border-2 text-left transition-all",
                    isRtl && "text-right",
                    selectedAnswer === option.score
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                  data-testid={`option-${idx}`}
                >
                  <span className="font-medium">
                    {isRtl ? option.textAr : option.textEn}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentIndex === 0}
                data-testid="back-btn"
              >
                <ChevronLeft className={cn("w-4 h-4", isRtl ? "rotate-180 ml-1" : "mr-1")} />
                {isRtl ? "السابق" : "Back"}
              </Button>
              <Button
                onClick={handleNext}
                disabled={selectedAnswer === undefined}
                data-testid="next-btn"
              >
                {currentIndex === questions.length - 1 
                  ? (isRtl ? "عرض النتيجة" : "See Results")
                  : (isRtl ? "التالي" : "Next")}
                <ChevronRight className={cn("w-4 h-4", isRtl ? "rotate-180 mr-1" : "ml-1")} />
              </Button>
            </div>
          </motion.div>
        )}

        {showResult && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6"
          >
            <div className={cn("rounded-xl p-6 mb-6", result.bgColor)}>
              <div className="flex items-start gap-4">
                <div className={cn("w-14 h-14 rounded-full flex items-center justify-center bg-white shadow-sm", result.color)}>
                  <result.icon className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-xl font-bold">
                      {isRtl ? result.titleAr : result.titleEn}
                    </h4>
                    <Badge variant="secondary" className="font-mono">
                      {result.score}/{result.maxScore}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    {isRtl ? result.descAr : result.descEn}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <h5 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                {isRtl ? "توصياتنا لك" : "Our Recommendations"}
              </h5>
              
              {result.recommendCourse && (
                <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h6 className="font-medium mb-1">
                      {isRtl ? "دورة تعليمية" : "Educational Course"}
                    </h6>
                    <p className="text-sm text-muted-foreground mb-3">
                      {isRtl ? result.courseReasonAr : result.courseReasonEn}
                    </p>
                    <Link href="/courses">
                      <Button size="sm" variant="outline" data-testid="view-courses-btn">
                        {isRtl ? "استكشف الدورات" : "Explore Courses"}
                        <ChevronRight className={cn("w-4 h-4", isRtl ? "rotate-180 mr-1" : "ml-1")} />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {result.recommendConsult && (
                <div className="flex items-start gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h6 className="font-medium mb-1">
                      {isRtl ? "استشارة شخصية" : "Personal Consultation"}
                    </h6>
                    <p className="text-sm text-muted-foreground mb-3">
                      {isRtl ? result.consultReasonAr : result.consultReasonEn}
                    </p>
                    <Link href="/consultations">
                      <Button size="sm" data-testid="book-consultation-btn">
                        {isRtl ? "احجز استشارة" : "Book Consultation"}
                        <ChevronRight className={cn("w-4 h-4", isRtl ? "rotate-180 mr-1" : "ml-1")} />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center">
              <Button variant="ghost" onClick={handleRestart} data-testid="restart-btn">
                <RefreshCcw className="w-4 h-4 mr-2" />
                {isRtl ? "إعادة التقييم" : "Retake Assessment"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
