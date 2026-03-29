import { useTranslation } from "react-i18next";
import type { Course, LearningPath } from "@shared/schema";

export function useLocalizedCourse() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const localize = (course: Course) => ({
    ...course,
    title: isArabic && course.titleAr ? course.titleAr : course.title,
    category: isArabic && course.categoryAr ? course.categoryAr : course.category,
    level: isArabic && course.levelAr ? course.levelAr : course.level,
    duration: isArabic && course.durationAr ? course.durationAr : course.duration,
    description: isArabic && course.descriptionAr ? course.descriptionAr : course.description,
    instructor: isArabic && course.instructorAr ? course.instructorAr : course.instructor,
    instructorBio: isArabic && course.instructorBioAr ? course.instructorBioAr : course.instructorBio,
    objectives: isArabic && course.objectivesAr ? course.objectivesAr : course.objectives,
    curriculum: isArabic && course.curriculumAr ? course.curriculumAr : course.curriculum,
    prerequisites: isArabic && course.prerequisitesAr ? course.prerequisitesAr : course.prerequisites,
  });
  return { localize, isArabic };
}

export function useLocalizedLearningPath() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const localize = (path: LearningPath) => ({
    ...path,
    title: isArabic && path.titleAr ? path.titleAr : path.title,
    description: isArabic && path.descriptionAr ? path.descriptionAr : path.description,
    level: isArabic && path.levelAr ? path.levelAr : path.level,
    estimatedDuration: isArabic && path.estimatedDurationAr ? path.estimatedDurationAr : path.estimatedDuration,
  });
  return { localize, isArabic };
}
