import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { BookOpen, GraduationCap, Clock, ArrowRight, Check, Lock, ChevronRight } from "lucide-react";
import type { LearningPath, Course, Enrollment } from "@shared/schema";
import { useLocalizedCourse, useLocalizedLearningPath } from "@/hooks/use-localized";

const imgBasics = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80";
const imgStocks = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80";
const imgPortfolio = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80";

const courseImages: Record<string, string> = {
  "Personal Finance": imgBasics,
  "Investing": imgStocks,
  "Strategy": imgPortfolio,
};

type LearningPathWithCourses = LearningPath & {
  courses: Array<{ course: Course; orderIndex: number }>;
};

export default function LearningPaths() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const { user, isAuthenticated } = useAuth();
  const { localize: localizeCourse } = useLocalizedCourse();
  const { localize: localizePath } = useLocalizedLearningPath();

  const { data: learningPaths = [], isLoading } = useQuery<LearningPathWithCourses[]>({
    queryKey: ["/api/learning-paths"],
    queryFn: async () => {
      const response = await fetch("/api/learning-paths");
      if (!response.ok) throw new Error("Failed to fetch");
      const paths = await response.json();
      
      const pathsWithCourses = await Promise.all(
        paths.map(async (path: LearningPath) => {
          const detailRes = await fetch(`/api/learning-paths/${path.id}`);
          if (detailRes.ok) {
            return await detailRes.json();
          }
          return { ...path, courses: [] };
        })
      );
      
      return pathsWithCourses;
    },
  });

  const { data: enrollments = [] } = useQuery<Enrollment[]>({
    queryKey: ["/api/enrollments"],
    queryFn: async () => {
      const response = await fetch("/api/enrollments", { credentials: "include" });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: isAuthenticated,
  });

  const getPathProgress = (path: LearningPathWithCourses) => {
    if (!path.courses || path.courses.length === 0) return 0;
    const completedCourses = path.courses.filter(pc => 
      enrollments.some(e => e.courseId === pc.course?.id && e.status === "completed")
    ).length;
    return Math.round((completedCourses / path.courses.length) * 100);
  };

  const isCourseCompleted = (courseId: string) => {
    return enrollments.some(e => e.courseId === courseId && e.status === "completed");
  };

  const isCourseEnrolled = (courseId: string) => {
    return enrollments.some(e => e.courseId === courseId);
  };

  return (
    <div className="min-h-screen bg-[#080A0F] text-[#dfe2eb] font-sans selection:bg-primary/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        {/* Animated Background Elements */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] pointer-events-none" />
        
        <div className="container px-4 mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
              <GraduationCap className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium tracking-wider uppercase text-primary/80">{t("learningPaths.title")}</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight leading-[1.1]" style={{ fontFamily: "'Syne', sans-serif" }}>
              {t("learningPaths.title")}
            </h1>
            
            <p className="text-lg text-muted-foreground/80 leading-relaxed max-w-2xl mx-auto">
              {t("learningPaths.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-32 relative">
        <div className="container px-4 mx-auto">
          {isLoading ? (
            <div className="grid gap-8">
              {[1, 2].map(i => (
                <div key={i} className="h-96 rounded-3xl bg-white/5 animate-pulse border border-white/5" />
              ))}
            </div>
          ) : learningPaths.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="w-10 h-10 text-primary/60" />
              </div>
              <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>{t("learningPaths.empty")}</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">{t("learningPaths.emptyDesc")}</p>
              <Button asChild size="lg" className="rounded-xl px-8 h-12 bg-gradient-to-r from-primary to-primary-container hover:shadow-lg hover:shadow-primary/20 transition-all">
                <Link href="/courses">{t("myCourses.browseCourses")}</Link>
              </Button>
            </motion.div>
          ) : (
            <div className="grid gap-16">
              {learningPaths.map((rawPath, pathIndex) => {
                const path = localizePath(rawPath);
                const progress = getPathProgress(rawPath);
                const sortedCourses = [...(rawPath.courses || [])].sort((a, b) => a.orderIndex - b.orderIndex);
                
                return (
                  <motion.div
                    key={path.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: pathIndex * 0.1, duration: 0.8 }}
                    className="group"
                  >
                    <div className="relative p-1 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-transparent">
                      <div className="bg-[#0D1117]/80 backdrop-blur-xl rounded-[2.4rem] overflow-hidden border border-white/5">
                        {/* Path Header */}
                        <div className="p-8 md:p-12 border-b border-white/5 bg-gradient-to-br from-primary/5 to-transparent">
                          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-3 mb-6">
                                <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase border border-primary/20">
                                  {path.level}
                                </span>
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 text-muted-foreground text-[10px] font-bold tracking-widest uppercase border border-white/10">
                                  <Clock className="w-3 h-3" />
                                  {path.estimatedDuration}
                                </span>
                              </div>
                              
                              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                                {path.title}
                              </h2>
                              
                              <p className="text-muted-foreground/80 leading-relaxed max-w-2xl">
                                {path.description}
                              </p>
                            </div>

                            {isAuthenticated && progress > 0 && (
                              <div className="w-full md:w-64 bg-white/5 p-6 rounded-2xl border border-white/5">
                                <div className="flex justify-between items-center mb-3">
                                  <span className="text-xs font-bold tracking-wider uppercase text-muted-foreground">{t("course.progress")}</span>
                                  <span className="text-lg font-bold text-primary">{progress}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${progress}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-primary/80 to-primary" 
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Journey Stepper */}
                        <div className="p-8 md:p-12">
                          <h3 className="text-sm font-bold tracking-widest uppercase text-muted-foreground mb-10 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {t("learningPaths.coursesInPath")} ({sortedCourses.length})
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                            {/* Connecting Line (Desktop) */}
                            <div className="absolute top-24 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 hidden md:block" />

                            {sortedCourses.map((pc, index) => {
                              const rawCourse = pc.course;
                              if (!rawCourse) return null;
                              const course = localizeCourse(rawCourse);
                              
                              const completed = isCourseCompleted(rawCourse.id);
                              const enrolled = isCourseEnrolled(rawCourse.id);
                              const isUnlocked = index === 0 || isCourseCompleted(sortedCourses[index - 1]?.course?.id);
                              
                              return (
                                <div key={rawCourse.id} className="relative group/course">
                                  {/* Step Indicator */}
                                  <div className="flex flex-col items-center mb-8 relative z-10">
                                    <div className={`
                                      w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-500
                                      ${completed ? 'bg-secondary text-secondary-foreground shadow-[0_0_20px_rgba(74,220,201,0.3)]' : 
                                        isUnlocked ? 'bg-primary text-primary-foreground shadow-[0_0_20px_rgba(242,195,91,0.3)]' : 
                                        'bg-white/5 text-muted-foreground border border-white/10 opacity-50'}
                                    `}>
                                      {completed ? <Check className="w-6 h-6" /> : index + 1}
                                    </div>
                                    <span className="mt-3 text-[10px] font-bold tracking-[.2em] uppercase text-muted-foreground/60">
                                      {t("learningPaths.step")} {index + 1}
                                    </span>
                                  </div>

                                  <div className={`
                                    relative p-4 rounded-3xl transition-all duration-500 border
                                    ${completed ? 'bg-secondary/5 border-secondary/20 h-full' : 
                                      isUnlocked ? 'bg-white/5 border-white/10 hover:border-primary/30 h-full' : 
                                      'bg-white/[0.02] border-white/5 opacity-40 grayscale'}
                                  `}>
                                    <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-6 group-hover/course:shadow-2xl transition-all duration-500">
                                      <img
                                        src={courseImages[rawCourse.category] || imgBasics}
                                        alt={course.title}
                                        className="object-cover w-full h-full transition-transform duration-700 group-hover/course:scale-110"
                                      />
                                      {!isUnlocked && (
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                                          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                                            <Lock className="w-5 h-5 text-white/60" />
                                          </div>
                                        </div>
                                      )}
                                      <div className="absolute top-3 left-3">
                                        <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[9px] font-bold tracking-wider text-white border border-white/10 uppercase">
                                          {rawCourse.category}
                                        </span>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                      <h4 className="text-lg font-bold leading-tight line-clamp-2 min-h-[3rem]" style={{ fontFamily: "'Syne', sans-serif" }}>
                                        {course.title}
                                      </h4>
                                      
                                      <div className="flex items-center gap-4 text-[10px] font-bold tracking-wider text-muted-foreground/60 uppercase">
                                        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {rawCourse.lessons} {t("courses.card.lessons")}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}</span>
                                      </div>
                                      
                                      <div className="pt-2">
                                        {completed ? (
                                          <Button asChild variant="outline" size="sm" className="w-full rounded-xl border-secondary/20 hover:bg-secondary/10 hover:text-secondary transition-all">
                                            <Link href={`/courses/${rawCourse.id}`}>
                                              {t("myCourses.reviewCourse")}
                                            </Link>
                                          </Button>
                                        ) : enrolled ? (
                                          <Button asChild size="sm" className="w-full rounded-xl bg-primary text-primary-foreground hover:shadow-[0_0_20px_rgba(242,195,91,0.3)] transition-all">
                                            <Link href={`/courses/${rawCourse.id}`}>
                                              {t("course.continueLearning")}
                                            </Link>
                                          </Button>
                                        ) : isUnlocked ? (
                                          <Button asChild size="sm" className="w-full rounded-xl bg-white/10 hover:bg-white/20 transition-all">
                                            <Link href={`/courses/${rawCourse.id}`}>
                                              {t("learningPaths.startCourse")}
                                            </Link>
                                          </Button>
                                        ) : (
                                          <Button disabled size="sm" className="w-full rounded-xl bg-white/5 text-muted-foreground/40 border border-white/5">
                                            <Lock className="w-3.5 h-3.5 mr-2 opacity-50" />
                                            {t("learningPaths.locked")}
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
