import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const workshopRequests = pgTable("workshop_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationName: text("organization_name").notNull(),
  organizationType: text("organization_type").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
  quotedPrice: integer("quoted_price"),
  scheduledDate: text("scheduled_date"),
  attendeesCount: integer("attendees_count"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const consultationBookings = pgTable("consultation_bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionType: text("session_type").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  notes: text("notes"),
  mode: text("mode").notNull().default("online"),
  location: text("location"),
  status: text("status").notNull().default("confirmed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  category: text("category").notNull(),
  categoryAr: text("category_ar"),
  level: text("level").notNull(),
  levelAr: text("level_ar"),
  price: integer("price").notNull(),
  students: integer("students").notNull().default(0),
  lessons: integer("lessons").notNull().default(0),
  duration: text("duration").notNull(),
  durationAr: text("duration_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  status: text("status").notNull().default("draft"),
  instructor: text("instructor").default("Yusuf"),
  instructorAr: text("instructor_ar"),
  instructorBio: text("instructor_bio"),
  instructorBioAr: text("instructor_bio_ar"),
  objectives: text("objectives"),
  objectivesAr: text("objectives_ar"),
  curriculum: text("curriculum"),
  curriculumAr: text("curriculum_ar"),
  prerequisites: text("prerequisites"),
  prerequisitesAr: text("prerequisites_ar"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const enrollments = pgTable("enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull(),
  studentEmail: text("student_email").notNull(),
  studentName: text("student_name").notNull(),
  progress: integer("progress").notNull().default(0),
  completedLessons: integer("completed_lessons").notNull().default(0),
  status: text("status").notNull().default("active"),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const learningPaths = pgTable("learning_paths", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  level: text("level").notNull().default("Beginner"),
  levelAr: text("level_ar"),
  estimatedDuration: text("estimated_duration"),
  estimatedDurationAr: text("estimated_duration_ar"),
  coursesCount: integer("courses_count").notNull().default(0),
  status: text("status").notNull().default("published"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const learningPathCourses = pgTable("learning_path_courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  learningPathId: varchar("learning_path_id").notNull(),
  courseId: varchar("course_id").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
});

export const consultationTypes = pgTable("consultation_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  bestFor: text("best_for"),
  bestForAr: text("best_for_ar"),
  outcome: text("outcome"),
  outcomeAr: text("outcome_ar"),
  price: integer("price").notNull(),
  duration: integer("duration").notNull(),
  color: text("color").notNull().default("bg-blue-500"),
  availableOnline: boolean("available_online").notNull().default(true),
  availableOffline: boolean("available_offline").notNull().default(true),
  status: text("status").notNull().default("active"),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const consultationAvailability = pgTable("consultation_availability", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dayOfWeek: integer("day_of_week").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workshopNotes = pgTable("workshop_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workshopRequestId: varchar("workshop_request_id").notNull(),
  note: text("note").notNull(),
  author: text("author").notNull().default("Admin"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referenceCode: text("reference_code").notNull(),
  userEmail: text("user_email").notNull(),
  userName: text("user_name").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("OMR"),
  method: text("method").notNull(),
  status: text("status").notNull().default("pending"),
  productType: text("product_type").notNull(),
  courseId: varchar("course_id"),
  consultationBookingId: varchar("consultation_booking_id"),
  sessionType: text("session_type"),
  proofUrl: text("proof_url"),
  transferReference: text("transfer_reference"),
  adminNotes: text("admin_notes"),
  verifiedBy: text("verified_by"),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Gmail Transaction Tracker tables
export const gmailConnections = pgTable("gmail_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  gmailEmail: text("gmail_email").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  emailId: text("email_id").notNull(), // Gmail message ID to deduplicate
  merchant: text("merchant").notNull(),
  amount: numeric("amount", { precision: 12, scale: 3 }).notNull(),
  currency: text("currency").notNull().default("OMR"),
  date: text("date").notNull(), // YYYY-MM-DD
  category: text("category").notNull().default("Other"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert Schemas
export const insertWorkshopRequestSchema = createInsertSchema(workshopRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  quotedPrice: true,
});

export const updateWorkshopRequestSchema = createInsertSchema(workshopRequests).omit({
  id: true,
  createdAt: true,
}).partial();

export const insertConsultationBookingSchema = createInsertSchema(consultationBookings).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  students: true,
});

export const updateCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  enrolledAt: true,
  completedAt: true,
  progress: true,
  completedLessons: true,
  status: true,
});

export const insertLearningPathSchema = createInsertSchema(learningPaths).omit({
  id: true,
  createdAt: true,
  coursesCount: true,
});

export const insertWorkshopNoteSchema = createInsertSchema(workshopNotes).omit({
  id: true,
  createdAt: true,
});

export const insertConsultationTypeSchema = createInsertSchema(consultationTypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateConsultationTypeSchema = createInsertSchema(consultationTypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export const insertConsultationAvailabilitySchema = createInsertSchema(consultationAvailability).omit({
  id: true,
  createdAt: true,
});

export const updateConsultationAvailabilitySchema = createInsertSchema(consultationAvailability).omit({
  id: true,
  createdAt: true,
}).partial();

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  verifiedBy: true,
  verifiedAt: true,
});

export const updatePaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
}).partial();

// Types (User and UpsertUser types come from ./models/auth)
export type WorkshopRequest = typeof workshopRequests.$inferSelect;
export type InsertWorkshopRequest = z.infer<typeof insertWorkshopRequestSchema>;
export type UpdateWorkshopRequest = z.infer<typeof updateWorkshopRequestSchema>;

export type ConsultationBooking = typeof consultationBookings.$inferSelect;
export type InsertConsultationBooking = z.infer<typeof insertConsultationBookingSchema>;

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type UpdateCourse = z.infer<typeof updateCourseSchema>;

export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;

export type LearningPath = typeof learningPaths.$inferSelect;
export type InsertLearningPath = z.infer<typeof insertLearningPathSchema>;

export type LearningPathCourse = typeof learningPathCourses.$inferSelect;

export type WorkshopNote = typeof workshopNotes.$inferSelect;
export type InsertWorkshopNote = z.infer<typeof insertWorkshopNoteSchema>;

export type ConsultationType = typeof consultationTypes.$inferSelect;
export type InsertConsultationType = z.infer<typeof insertConsultationTypeSchema>;
export type UpdateConsultationType = z.infer<typeof updateConsultationTypeSchema>;

export type ConsultationAvailability = typeof consultationAvailability.$inferSelect;
export type InsertConsultationAvailability = z.infer<typeof insertConsultationAvailabilitySchema>;
export type UpdateConsultationAvailability = z.infer<typeof updateConsultationAvailabilitySchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type UpdatePayment = z.infer<typeof updatePaymentSchema>;

export type GmailConnection = typeof gmailConnections.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
