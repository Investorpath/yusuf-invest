import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { BookOpen, PlayCircle, Clock, GraduationCap } from "lucide-react";
import type { Course, Enrollment } from "@shared/schema";
import { useEffect } from "react";
import { useLocalizedCourse } from "@/hooks/use-localized";

const imgBasics = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80";
const imgStocks = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80";
const imgPortfolio = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80";

const courseImages: Record<string, string> = {
  "Personal Finance": imgBasics,
  "Investing": imgStocks,
  "Strategy": imgPortfolio,
};

export default function MyCourses() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { localize } = useLocalizedCourse();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/api/login";
    }
  }, [authLoading, isAuthenticated]);

  const { data: enrollments = [], isLoading } = useQuery<(Enrollment & { course?: Course })[]>({
    queryKey: ["/api/enrollments"],
    queryFn: async () => {
      const response = await fetch("/api/enrollments", { credentials: "include" });
      if (!response.ok) {
        if (response.status === 401) return [];
        throw new Error("Failed to fetch enrollments");
      }
      const enrollments = await response.json();
      
      const enrollmentsWithCourses = await Promise.all(
        enrollments.map(async (enrollment: Enrollment) => {
          const courseRes = await fetch(`/api/courses/${enrollment.courseId}`);
          const course = courseRes.ok ? await courseRes.json() : null;
          return { ...enrollment, course };
        })
      );
      
      return enrollmentsWithCourses;
    },
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background font-sans">
        <Navbar />
        <div className="container px-4 mx-auto py-20 text-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  const activeEnrollments = enrollments.filter(e => e.status === "active");
  const completedEnrollments = enrollments.filter(e => e.status === "completed");

  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />

      <section className="bg-slate-50 dark:bg-slate-900/50 py-16">
        <div className="container px-4 mx-auto text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-serif font-bold">{t("myCourses.title")}</h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            {t("myCourses.subtitle")}
          </motion.p>
        </div>
      </section>

      <section className="py-12">
        <div className="container px-4 mx-auto">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-video bg-muted" />
                  <CardContent className="p-6 space-y-3">
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : enrollments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-serif font-bold mb-2">{t("myCourses.empty")}</h2>
              <p className="text-muted-foreground mb-6">{t("myCourses.emptyDesc")}</p>
              <Button asChild>
                <Link href="/courses">{t("myCourses.browseCourses")}</Link>
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-12">
              {activeEnrollments.length > 0 && (
                <div>
                  <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
                    <PlayCircle className="w-6 h-6 text-primary" />
                    {t("myCourses.inProgress")}
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {activeEnrollments.map((enrollment, index) => {
                      const course = enrollment.course ? localize(enrollment.course) : null;
                      return (
                        <motion.div
                          key={enrollment.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                            <div className="relative aspect-video overflow-hidden">
                              <img
                                src={courseImages[enrollment.course?.category || ""] || imgBasics}
                                alt={course?.title}
                                className="object-cover w-full h-full"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              <div className="absolute bottom-3 left-3 right-3">
                                <Progress value={enrollment.progress} className="h-2" />
                                <p className="text-white text-xs mt-1">{enrollment.progress}% {t("myCourses.complete")}</p>
                              </div>
                            </div>

                            <CardHeader>
                              <Badge variant="outline" className="w-fit mb-2">
                                {course?.category}
                              </Badge>
                              <CardTitle className="font-serif text-lg line-clamp-2">
                                {course?.title}
                              </CardTitle>
                            </CardHeader>

                            <CardContent>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                  <PlayCircle className="w-4 h-4" />
                                  {enrollment.completedLessons}/{enrollment.course?.lessons} {t("courses.card.lessons")}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-4 h-4" />
                                  {course?.duration}
                                </div>
                              </div>
                            </CardContent>

                            <CardFooter className="p-4 pt-0">
                              <Button asChild className="w-full" data-testid={`button-continue-${enrollment.id}`}>
                                <Link href={`/courses/${enrollment.courseId}`}>
                                  {t("course.continueLearning")}
                                </Link>
                              </Button>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {completedEnrollments.length > 0 && (
                <div>
                  <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
                    <GraduationCap className="w-6 h-6 text-green-500" />
                    {t("myCourses.completed")}
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {completedEnrollments.map((enrollment, index) => {
                      const course = enrollment.course ? localize(enrollment.course) : null;
                      return (
                        <motion.div
                          key={enrollment.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="overflow-hidden border-green-500/20">
                            <div className="relative aspect-video overflow-hidden">
                              <img
                                src={courseImages[enrollment.course?.category || ""] || imgBasics}
                                alt={course?.title}
                                className="object-cover w-full h-full"
                              />
                              <div className={`absolute top-3 ${isRtl ? 'left-3' : 'right-3'}`}>
                                <Badge className="bg-green-500">
                                  <GraduationCap className="w-3 h-3 me-1" />
                                  {t("myCourses.completedBadge")}
                                </Badge>
                              </div>
                            </div>

                            <CardHeader>
                              <CardTitle className="font-serif text-lg line-clamp-2">
                                {course?.title}
                              </CardTitle>
                            </CardHeader>

                            <CardFooter className="p-4 pt-0">
                              <Button asChild variant="outline" className="w-full">
                                <Link href={`/courses/${enrollment.courseId}`}>
                                  {t("myCourses.reviewCourse")}
                                </Link>
                              </Button>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
