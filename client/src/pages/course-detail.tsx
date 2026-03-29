import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  BookOpen, Users, Clock, PlayCircle, ChevronLeft, 
  Check, Lock, User, GraduationCap, Target, List, Play
} from "lucide-react";
import type { Course, Enrollment, Payment } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLocalizedCourse } from "@/hooks/use-localized";
import { useState, useEffect } from "react";
import { PaymentModal } from "@/components/payment-modal";

const imgBasics = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80";
const imgStocks = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80";
const imgPortfolio = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80";

const courseImages: Record<string, string> = {
  "Personal Finance": imgBasics,
  "Investing": imgStocks,
  "Strategy": imgPortfolio,
};

interface CurriculumLesson {
  title: string;
  youtubeUrl?: string;
}

interface CurriculumSection {
  title: string;
  lessons: (CurriculumLesson | string)[];
}

function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /youtube\.com\/v\/([^&\s?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function normalizeLesson(lesson: CurriculumLesson | string): CurriculumLesson {
  if (typeof lesson === "string") {
    return { title: lesson, youtubeUrl: "" };
  }
  return lesson;
}

export default function CourseDetail() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { localize } = useLocalizedCourse();
  const [selectedLesson, setSelectedLesson] = useState<{ sectionIndex: number; lessonIndex: number } | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  const { data: rawCourse, isLoading } = useQuery<Course>({
    queryKey: ["/api/courses", id],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${id}`);
      if (!response.ok) throw new Error("Failed to fetch course");
      return response.json();
    },
    enabled: !!id,
  });

  const { data: enrollment } = useQuery<Enrollment | null>({
    queryKey: ["/api/enrollment", id],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${id}/enrollment`, { credentials: "include" });
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!id && isAuthenticated,
  });

  const { data: existingPayment } = useQuery<Payment | null>({
    queryKey: ["/api/payments/course", id],
    queryFn: async () => {
      const response = await fetch(`/api/payments/course/${id}`, { credentials: "include" });
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!id && isAuthenticated && !enrollment,
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ progress, completedCount }: { progress: number; completedCount: number }) => {
      if (!enrollment) return;
      const response = await fetch(`/api/enrollments/${enrollment.id}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ progress, completedLessons: completedCount }),
      });
      if (!response.ok) throw new Error("Failed to update progress");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enrollment", id] });
    },
  });

  const handleEnrollClick = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/payments/course", id] });
  };

  useEffect(() => {
    if (id && enrollment) {
      const storageKey = `course_${id}_completed_lessons`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const lessonIds = JSON.parse(stored);
          setCompletedLessons(new Set(lessonIds));
        } catch {
          setCompletedLessons(new Set());
        }
      }
    }
  }, [id, enrollment]);

  const getLessonKey = (sectionIndex: number, lessonIndex: number) => `${sectionIndex}-${lessonIndex}`;

  const handleMarkComplete = () => {
    if (!selectedLesson || !rawCourse || !id) return;
    
    const lessonKey = getLessonKey(selectedLesson.sectionIndex, selectedLesson.lessonIndex);
    const newCompletedLessons = new Set(completedLessons);
    newCompletedLessons.add(lessonKey);
    setCompletedLessons(newCompletedLessons);

    const storageKey = `course_${id}_completed_lessons`;
    localStorage.setItem(storageKey, JSON.stringify(Array.from(newCompletedLessons)));

    const curriculum: CurriculumSection[] = rawCourse.curriculum ? JSON.parse(rawCourse.curriculum) : [];
    const totalLessons = curriculum.reduce((acc, section) => acc + section.lessons.length, 0);
    const completedCount = newCompletedLessons.size;
    const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    updateProgressMutation.mutate({ progress, completedCount });
    
    toast({
      title: t("course.lessonCompleted"),
      description: t("course.progressUpdated"),
    });
  };

  const isLessonCompleted = (sectionIndex: number, lessonIndex: number) => {
    return completedLessons.has(getLessonKey(sectionIndex, lessonIndex));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background font-sans">
        <Navbar />
        <div className="container px-4 mx-auto py-20 text-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  const course = rawCourse ? localize(rawCourse) : null;

  if (!course) {
    return (
      <div className="min-h-screen bg-background font-sans">
        <Navbar />
        <div className="container px-4 mx-auto py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">{t("course.notFound")}</h1>
          <Button asChild>
            <Link href="/courses">{t("course.backToCourses")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const objectives = course.objectives ? course.objectives.split('\n').filter(o => o.trim()) : [];
  const prerequisites = course.prerequisites ? course.prerequisites.split('\n').filter(p => p.trim()) : [];
  const curriculum: CurriculumSection[] = course.curriculum ? JSON.parse(course.curriculum) : [];

  const currentLesson = selectedLesson 
    ? normalizeLesson(curriculum[selectedLesson.sectionIndex]?.lessons[selectedLesson.lessonIndex])
    : null;
  const currentVideoId = currentLesson?.youtubeUrl ? extractYouTubeVideoId(currentLesson.youtubeUrl) : null;

  const handleLessonClick = (sectionIndex: number, lessonIndex: number) => {
    if (enrollment) {
      setSelectedLesson({ sectionIndex, lessonIndex });
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />

      {enrollment && selectedLesson && currentVideoId && (
        <div className="bg-slate-900">
          <div className="container px-4 mx-auto py-4">
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <div className="aspect-video rounded-lg overflow-hidden bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${currentVideoId}?rel=0`}
                    title={currentLesson?.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="py-4 flex items-center justify-between text-white">
                  <div>
                    <p className="text-sm text-gray-400">
                      {t("course.nowPlaying")}
                    </p>
                    <h3 className="font-medium">{currentLesson?.title}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    {selectedLesson && !isLessonCompleted(selectedLesson.sectionIndex, selectedLesson.lessonIndex) ? (
                      <Button 
                        size="sm" 
                        onClick={handleMarkComplete}
                        disabled={updateProgressMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                        data-testid="button-mark-complete"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        {updateProgressMutation.isPending ? t("course.saving") : t("course.markComplete")}
                      </Button>
                    ) : selectedLesson && (
                      <Badge className="bg-green-600 text-white">
                        <Check className="w-3 h-3 mr-1" />
                        {t("course.completed")}
                      </Badge>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedLesson(null)}
                      className="text-white border-white/30 hover:bg-white/10"
                    >
                      {t("course.closePlayer")}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-800 rounded-lg max-h-[500px] overflow-y-auto">
                <div className="p-4 border-b border-slate-700 sticky top-0 bg-slate-800">
                  <h3 className="font-medium text-white">{t("course.curriculum")}</h3>
                  <p className="text-sm text-gray-400">
                    {curriculum.reduce((acc, s) => acc + (s.lessons?.length || 0), 0)} {t("courses.card.lessons")}
                  </p>
                </div>
                <div className="p-2">
                  {curriculum.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="mb-3">
                      <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase">
                        {section.title}
                      </div>
                      <div className="space-y-1">
                        {section.lessons?.map((rawLesson, lessonIndex) => {
                          const lesson = normalizeLesson(rawLesson);
                          const hasVideo = !!lesson.youtubeUrl && extractYouTubeVideoId(lesson.youtubeUrl);
                          const isSelected = selectedLesson?.sectionIndex === sectionIndex && selectedLesson?.lessonIndex === lessonIndex;
                          const lessonCompleted = isLessonCompleted(sectionIndex, lessonIndex);
                          
                          return (
                            <button
                              key={lessonIndex}
                              onClick={() => hasVideo && handleLessonClick(sectionIndex, lessonIndex)}
                              disabled={!hasVideo}
                              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-start transition-colors ${
                                isSelected 
                                  ? 'bg-primary text-white' 
                                  : lessonCompleted
                                  ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                                  : hasVideo
                                  ? 'text-gray-300 hover:bg-slate-700'
                                  : 'text-gray-500 cursor-not-allowed'
                              }`}
                              data-testid={`sidebar-lesson-${sectionIndex}-${lessonIndex}`}
                            >
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                lessonCompleted 
                                  ? 'bg-green-600 text-white'
                                  : isSelected 
                                  ? 'bg-white/20' 
                                  : 'bg-slate-600'
                              }`}>
                                {lessonCompleted ? (
                                  <Check className="w-3 h-3" />
                                ) : (
                                  <span className="text-xs">{lessonIndex + 1}</span>
                                )}
                              </div>
                              <span className="flex-1 text-sm truncate">{lesson.title}</span>
                              {isSelected && <Play className="w-4 h-4 flex-shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-50 dark:bg-slate-900/50 py-8 border-b">
        <div className="container px-4 mx-auto">
          <Link href="/courses" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
            <ChevronLeft className="w-4 h-4" />
            {t("course.backToCourses")}
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2"
            >
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">{course.category}</Badge>
                <Badge variant="outline" className="border-primary/20 text-primary">{course.level}</Badge>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">{course.title}</h1>
              
              <p className="text-lg text-muted-foreground mb-6">{course.description}</p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{course.instructor || "Yusuf"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{course.students.toLocaleString()} {t("courses.card.students")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PlayCircle className="w-4 h-4" />
                  <span>{course.lessons} {t("courses.card.lessons")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration}</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="sticky top-24 overflow-hidden">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={(rawCourse as any)?.image || courseImages[course.category] || imgBasics} 
                    alt={course.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-primary mb-4">
                    {course.price} OMR
                  </div>

                  {enrollment ? (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>{t("course.progress")}</span>
                          <span>{enrollment.progress}%</span>
                        </div>
                        <Progress value={enrollment.progress} />
                      </div>
                      <Button 
                        className="w-full" 
                        size="lg" 
                        data-testid="button-continue-learning"
                        onClick={() => {
                          if (curriculum.length > 0 && curriculum[0].lessons?.length > 0) {
                            setSelectedLesson({ sectionIndex: 0, lessonIndex: 0 });
                          }
                        }}
                      >
                        {t("course.continueLearning")}
                      </Button>
                    </div>
                  ) : isAuthenticated ? (
                    existingPayment?.status === "pending" ? (
                      <div className="space-y-4">
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-center">
                          <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                            {t("payment.pendingApproval")}
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                            {t("payment.referenceCode")}: {existingPayment.referenceCode}
                          </p>
                        </div>
                        <Button 
                          variant="outline"
                          className="w-full" 
                          size="lg"
                          onClick={handleEnrollClick}
                          data-testid="button-view-payment"
                        >
                          {t("payment.awaitingPayment")}
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="w-full" 
                        size="lg" 
                        onClick={handleEnrollClick}
                        data-testid="button-enroll"
                      >
                        {t("courses.card.enroll")}
                      </Button>
                    )
                  ) : (
                    <div className="space-y-4">
                      <Button asChild className="w-full" size="lg" data-testid="button-login-to-enroll">
                        <a href="/api/login">{t("course.loginToEnroll")}</a>
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        {t("course.loginRequired")}
                      </p>
                    </div>
                  )}

                  <Separator className="my-4" />
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>{t("course.lifetime")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>{t("course.certificate")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>{t("course.mobile")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      <section className="py-12">
        <div className="container px-4 mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-12">
              {objectives.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <Target className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-serif font-bold">{t("course.objectives")}</h2>
                  </div>
                  <Card>
                    <CardContent className="p-6">
                      <ul className="grid md:grid-cols-2 gap-3">
                        {objectives.map((obj, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {curriculum.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <List className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-serif font-bold">{t("course.curriculum")}</h2>
                  </div>
                  <Card>
                    <CardContent className="p-0">
                      <Accordion type="single" collapsible className="w-full" defaultValue="section-0">
                        {curriculum.map((section, sectionIndex) => (
                          <AccordionItem key={sectionIndex} value={`section-${sectionIndex}`}>
                            <AccordionTrigger className="px-6 hover:no-underline">
                              <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                                  {sectionIndex + 1}
                                </span>
                                <div className="text-start">
                                  <span className="font-medium">{section.title}</span>
                                  <p className="text-xs text-muted-foreground">
                                    {section.lessons?.length || 0} {t("courses.card.lessons")}
                                  </p>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-4">
                              <ul className="space-y-1 ms-11">
                                {section.lessons?.map((rawLesson, lessonIndex) => {
                                  const lesson = normalizeLesson(rawLesson);
                                  const hasVideo = !!lesson.youtubeUrl && extractYouTubeVideoId(lesson.youtubeUrl);
                                  const isSelected = selectedLesson?.sectionIndex === sectionIndex && selectedLesson?.lessonIndex === lessonIndex;
                                  const lessonCompleted = isLessonCompleted(sectionIndex, lessonIndex);
                                  
                                  return (
                                    <li key={lessonIndex}>
                                      {enrollment && hasVideo ? (
                                        <button
                                          onClick={() => handleLessonClick(sectionIndex, lessonIndex)}
                                          className={`w-full flex items-center gap-3 p-2 rounded-lg text-start transition-colors ${
                                            isSelected 
                                              ? 'bg-primary/10 text-primary' 
                                              : lessonCompleted
                                              ? 'bg-green-50 dark:bg-green-900/10'
                                              : 'hover:bg-muted'
                                          }`}
                                          data-testid={`lesson-${sectionIndex}-${lessonIndex}`}
                                        >
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                            lessonCompleted 
                                              ? 'bg-green-600 text-white'
                                              : isSelected 
                                              ? 'bg-primary text-white' 
                                              : 'bg-muted'
                                          }`}>
                                            {lessonCompleted ? <Check className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                          </div>
                                          <span className="flex-1 text-sm">{lesson.title}</span>
                                          {lessonCompleted && (
                                            <Check className="w-4 h-4 text-green-600" />
                                          )}
                                        </button>
                                      ) : enrollment ? (
                                        <div className="flex items-center gap-3 p-2 text-muted-foreground">
                                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                            <PlayCircle className="w-4 h-4" />
                                          </div>
                                          <span className="flex-1 text-sm">{lesson.title}</span>
                                          {!hasVideo && (
                                            <span className="text-xs text-muted-foreground">{t("course.comingSoon")}</span>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-3 p-2 text-muted-foreground">
                                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                            <Lock className="w-4 h-4" />
                                          </div>
                                          <span className="flex-1 text-sm">{lesson.title}</span>
                                        </div>
                                      )}
                                    </li>
                                  );
                                })}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {course.instructorBio && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <GraduationCap className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-serif font-bold">{t("course.instructor")}</h2>
                  </div>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                          {course.instructor?.[0] || "Y"}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{course.instructor || "Yusuf"}</h3>
                          <p className="text-muted-foreground mt-2">{course.instructorBio}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            <div className="space-y-6">
              {prerequisites.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BookOpen className="w-5 h-5" />
                      {t("course.prerequisites")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {prerequisites.map((prereq, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{prereq}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {course && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          productType="course"
          productName={course.title}
          amount={course.price}
          currency="OMR"
          courseId={id}
          onPaymentCreated={handlePaymentCreated}
        />
      )}
    </div>
  );
}
