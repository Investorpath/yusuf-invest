// Referenced: blueprint:javascript_database
import { 
  workshopRequests, 
  consultationBookings,
  courses,
  enrollments,
  learningPaths,
  learningPathCourses,
  workshopNotes,
  payments,
  consultationTypes,
  consultationAvailability,
  users,
  type User,
  type UpsertUser,
  type WorkshopRequest,
  type InsertWorkshopRequest,
  type UpdateWorkshopRequest,
  type ConsultationBooking,
  type InsertConsultationBooking,
  type Course,
  type InsertCourse,
  type UpdateCourse,
  type Enrollment,
  type InsertEnrollment,
  type LearningPath,
  type InsertLearningPath,
  type LearningPathCourse,
  type WorkshopNote,
  type InsertWorkshopNote,
  type Payment,
  type InsertPayment,
  type UpdatePayment,
  type ConsultationType,
  type InsertConsultationType,
  type UpdateConsultationType,
  type ConsultationAvailability,
  type InsertConsultationAvailability,
  type UpdateConsultationAvailability,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or } from "drizzle-orm";

export interface IStorage {
  
  // Workshop request methods
  createWorkshopRequest(request: InsertWorkshopRequest): Promise<WorkshopRequest>;
  getAllWorkshopRequests(): Promise<WorkshopRequest[]>;
  getWorkshopRequest(id: string): Promise<WorkshopRequest | undefined>;
  updateWorkshopRequest(id: string, data: UpdateWorkshopRequest): Promise<WorkshopRequest>;
  
  // Workshop notes methods
  getWorkshopNotes(workshopRequestId: string): Promise<WorkshopNote[]>;
  addWorkshopNote(note: InsertWorkshopNote): Promise<WorkshopNote>;
  
  // Consultation booking methods
  createConsultationBooking(booking: InsertConsultationBooking): Promise<ConsultationBooking>;
  getAllConsultationBookings(): Promise<ConsultationBooking[]>;
  getConsultationBooking(id: string): Promise<ConsultationBooking | undefined>;
  updateConsultationStatus(id: string, status: string): Promise<ConsultationBooking>;
  
  // Course methods
  getAllCourses(): Promise<Course[]>;
  getPublishedCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, course: UpdateCourse): Promise<Course>;
  deleteCourse(id: string): Promise<void>;
  
  // Enrollment methods
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  getEnrollmentsByEmail(email: string): Promise<Enrollment[]>;
  getEnrollmentsByCourse(courseId: string): Promise<Enrollment[]>;
  getEnrollment(courseId: string, email: string): Promise<Enrollment | undefined>;
  updateEnrollmentProgress(id: string, progress: number, completedLessons: number): Promise<Enrollment>;
  
  // Learning path methods
  getAllLearningPaths(): Promise<LearningPath[]>;
  getLearningPath(id: string): Promise<LearningPath | undefined>;
  createLearningPath(path: InsertLearningPath): Promise<LearningPath>;
  getLearningPathCourses(learningPathId: string): Promise<LearningPathCourse[]>;
  addCourseToLearningPath(learningPathId: string, courseId: string, orderIndex: number): Promise<LearningPathCourse>;
  
  // Payment methods
  createPayment(payment: InsertPayment): Promise<Payment>;
  getAllPayments(): Promise<Payment[]>;
  getPendingPayments(): Promise<Payment[]>;
  getPayment(id: string): Promise<Payment | undefined>;
  getPaymentByReference(referenceCode: string): Promise<Payment | undefined>;
  getPaymentsByEmail(email: string): Promise<Payment[]>;
  getPaymentForCourse(courseId: string, email: string): Promise<Payment | undefined>;
  getPaymentForConsultation(consultationBookingId: string): Promise<Payment | undefined>;
  updatePayment(id: string, data: UpdatePayment): Promise<Payment>;
  approvePayment(id: string, verifiedBy: string, notes?: string): Promise<Payment>;
  rejectPayment(id: string, verifiedBy: string, notes?: string): Promise<Payment>;
  
  // Consultation type methods
  getAllConsultationTypes(): Promise<ConsultationType[]>;
  getActiveConsultationTypes(): Promise<ConsultationType[]>;
  getConsultationType(id: string): Promise<ConsultationType | undefined>;
  createConsultationType(type: InsertConsultationType): Promise<ConsultationType>;
  updateConsultationType(id: string, type: UpdateConsultationType): Promise<ConsultationType>;
  deleteConsultationType(id: string): Promise<void>;
  
  // Consultation availability methods
  getAllConsultationAvailability(): Promise<ConsultationAvailability[]>;
  getActiveConsultationAvailability(): Promise<ConsultationAvailability[]>;
  createConsultationAvailability(availability: InsertConsultationAvailability): Promise<ConsultationAvailability>;
  updateConsultationAvailability(id: string, availability: UpdateConsultationAvailability): Promise<ConsultationAvailability>;
  deleteConsultationAvailability(id: string): Promise<void>;

  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  upsertUser(userData: UpsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  // Workshop request methods
  async createWorkshopRequest(request: InsertWorkshopRequest): Promise<WorkshopRequest> {
    const [workshopRequest] = await db
      .insert(workshopRequests)
      .values(request)
      .returning();
    return workshopRequest;
  }

  async getAllWorkshopRequests(): Promise<WorkshopRequest[]> {
    return await db.select().from(workshopRequests).orderBy(desc(workshopRequests.createdAt));
  }

  async getWorkshopRequest(id: string): Promise<WorkshopRequest | undefined> {
    const [request] = await db.select().from(workshopRequests).where(eq(workshopRequests.id, id));
    return request || undefined;
  }

  async updateWorkshopRequest(id: string, data: UpdateWorkshopRequest): Promise<WorkshopRequest> {
    const [updated] = await db
      .update(workshopRequests)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(workshopRequests.id, id))
      .returning();
    return updated;
  }

  // Workshop notes methods
  async getWorkshopNotes(workshopRequestId: string): Promise<WorkshopNote[]> {
    return await db.select().from(workshopNotes)
      .where(eq(workshopNotes.workshopRequestId, workshopRequestId))
      .orderBy(desc(workshopNotes.createdAt));
  }

  async addWorkshopNote(note: InsertWorkshopNote): Promise<WorkshopNote> {
    const [newNote] = await db
      .insert(workshopNotes)
      .values(note)
      .returning();
    return newNote;
  }

  // Consultation booking methods
  async createConsultationBooking(booking: InsertConsultationBooking): Promise<ConsultationBooking> {
    const [consultationBooking] = await db
      .insert(consultationBookings)
      .values(booking)
      .returning();
    return consultationBooking;
  }

  async getAllConsultationBookings(): Promise<ConsultationBooking[]> {
    return await db.select().from(consultationBookings).orderBy(desc(consultationBookings.createdAt));
  }

  async getConsultationBooking(id: string): Promise<ConsultationBooking | undefined> {
    const [booking] = await db.select().from(consultationBookings).where(eq(consultationBookings.id, id));
    return booking || undefined;
  }

  async updateConsultationStatus(id: string, status: string): Promise<ConsultationBooking> {
    const [updated] = await db
      .update(consultationBookings)
      .set({ status })
      .where(eq(consultationBookings.id, id))
      .returning();
    return updated;
  }

  // Course methods
  async getAllCourses(): Promise<Course[]> {
    return await db.select().from(courses).orderBy(desc(courses.createdAt));
  }

  async getPublishedCourses(): Promise<Course[]> {
    return await db.select().from(courses)
      .where(eq(courses.status, "published"))
      .orderBy(desc(courses.createdAt));
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course || undefined;
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const [course] = await db
      .insert(courses)
      .values(insertCourse)
      .returning();
    return course;
  }

  async updateCourse(id: string, updateCourse: UpdateCourse): Promise<Course> {
    const [course] = await db
      .update(courses)
      .set({ ...updateCourse, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return course;
  }

  async deleteCourse(id: string): Promise<void> {
    await db.delete(courses).where(eq(courses.id, id));
  }

  // Enrollment methods
  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const [newEnrollment] = await db
      .insert(enrollments)
      .values(enrollment)
      .returning();
    
    // Update course student count
    const course = await this.getCourse(enrollment.courseId);
    if (course) {
      await db.update(courses)
        .set({ students: course.students + 1 })
        .where(eq(courses.id, enrollment.courseId));
    }
    
    return newEnrollment;
  }

  async getEnrollmentsByEmail(email: string): Promise<Enrollment[]> {
    return await db.select().from(enrollments)
      .where(eq(enrollments.studentEmail, email))
      .orderBy(desc(enrollments.enrolledAt));
  }

  async getEnrollmentsByCourse(courseId: string): Promise<Enrollment[]> {
    return await db.select().from(enrollments)
      .where(eq(enrollments.courseId, courseId))
      .orderBy(desc(enrollments.enrolledAt));
  }

  async getEnrollment(courseId: string, email: string): Promise<Enrollment | undefined> {
    const [enrollment] = await db.select().from(enrollments)
      .where(and(eq(enrollments.courseId, courseId), eq(enrollments.studentEmail, email)));
    return enrollment || undefined;
  }

  async updateEnrollmentProgress(id: string, progress: number, completedLessons: number): Promise<Enrollment> {
    const [updated] = await db
      .update(enrollments)
      .set({ 
        progress, 
        completedLessons,
        status: progress >= 100 ? "completed" : "active",
        completedAt: progress >= 100 ? new Date() : null
      })
      .where(eq(enrollments.id, id))
      .returning();
    return updated;
  }

  // Learning path methods
  async getAllLearningPaths(): Promise<LearningPath[]> {
    return await db.select().from(learningPaths)
      .where(eq(learningPaths.status, "published"))
      .orderBy(desc(learningPaths.createdAt));
  }

  async getLearningPath(id: string): Promise<LearningPath | undefined> {
    const [path] = await db.select().from(learningPaths).where(eq(learningPaths.id, id));
    return path || undefined;
  }

  async createLearningPath(path: InsertLearningPath): Promise<LearningPath> {
    const [newPath] = await db
      .insert(learningPaths)
      .values(path)
      .returning();
    return newPath;
  }

  async getLearningPathCourses(learningPathId: string): Promise<LearningPathCourse[]> {
    return await db.select().from(learningPathCourses)
      .where(eq(learningPathCourses.learningPathId, learningPathId))
      .orderBy(learningPathCourses.orderIndex);
  }

  async addCourseToLearningPath(learningPathId: string, courseId: string, orderIndex: number): Promise<LearningPathCourse> {
    const [pathCourse] = await db
      .insert(learningPathCourses)
      .values({ learningPathId, courseId, orderIndex })
      .returning();
    
    // Update learning path course count
    const path = await this.getLearningPath(learningPathId);
    if (path) {
      await db.update(learningPaths)
        .set({ coursesCount: path.coursesCount + 1 })
        .where(eq(learningPaths.id, learningPathId));
    }
    
    return pathCourse;
  }

  // Payment methods
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db
      .insert(payments)
      .values(payment)
      .returning();
    return newPayment;
  }

  async getAllPayments(): Promise<Payment[]> {
    return await db.select().from(payments).orderBy(desc(payments.createdAt));
  }

  async getPendingPayments(): Promise<Payment[]> {
    return await db.select().from(payments)
      .where(eq(payments.status, "pending"))
      .orderBy(desc(payments.createdAt));
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || undefined;
  }

  async getPaymentByReference(referenceCode: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments)
      .where(eq(payments.referenceCode, referenceCode));
    return payment || undefined;
  }

  async getPaymentsByEmail(email: string): Promise<Payment[]> {
    return await db.select().from(payments)
      .where(eq(payments.userEmail, email))
      .orderBy(desc(payments.createdAt));
  }

  async getPaymentForCourse(courseId: string, email: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments)
      .where(and(
        eq(payments.courseId, courseId),
        eq(payments.userEmail, email),
        or(eq(payments.status, "pending"), eq(payments.status, "approved"))
      ));
    return payment || undefined;
  }

  async getPaymentForConsultation(consultationBookingId: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments)
      .where(eq(payments.consultationBookingId, consultationBookingId));
    return payment || undefined;
  }

  async updatePayment(id: string, data: UpdatePayment): Promise<Payment> {
    const [updated] = await db
      .update(payments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    return updated;
  }

  async approvePayment(id: string, verifiedBy: string, notes?: string): Promise<Payment> {
    const [updated] = await db
      .update(payments)
      .set({ 
        status: "approved", 
        verifiedBy, 
        verifiedAt: new Date(),
        adminNotes: notes,
        updatedAt: new Date()
      })
      .where(eq(payments.id, id))
      .returning();
    return updated;
  }

  async rejectPayment(id: string, verifiedBy: string, notes?: string): Promise<Payment> {
    const [updated] = await db
      .update(payments)
      .set({ 
        status: "rejected", 
        verifiedBy, 
        verifiedAt: new Date(),
        adminNotes: notes,
        updatedAt: new Date()
      })
      .where(eq(payments.id, id))
      .returning();
    return updated;
  }

  // Consultation type methods
  async getAllConsultationTypes(): Promise<ConsultationType[]> {
    return await db.select().from(consultationTypes).orderBy(consultationTypes.orderIndex);
  }

  async getActiveConsultationTypes(): Promise<ConsultationType[]> {
    return await db.select().from(consultationTypes)
      .where(eq(consultationTypes.status, "active"))
      .orderBy(consultationTypes.orderIndex);
  }

  async getConsultationType(id: string): Promise<ConsultationType | undefined> {
    const [type] = await db.select().from(consultationTypes).where(eq(consultationTypes.id, id));
    return type || undefined;
  }

  async createConsultationType(type: InsertConsultationType): Promise<ConsultationType> {
    const [newType] = await db
      .insert(consultationTypes)
      .values(type)
      .returning();
    return newType;
  }

  async updateConsultationType(id: string, type: UpdateConsultationType): Promise<ConsultationType> {
    const [updated] = await db
      .update(consultationTypes)
      .set({ ...type, updatedAt: new Date() })
      .where(eq(consultationTypes.id, id))
      .returning();
    return updated;
  }

  async deleteConsultationType(id: string): Promise<void> {
    await db.delete(consultationTypes).where(eq(consultationTypes.id, id));
  }

  // Consultation availability methods
  async getAllConsultationAvailability(): Promise<ConsultationAvailability[]> {
    return await db.select().from(consultationAvailability).orderBy(consultationAvailability.dayOfWeek);
  }

  async getActiveConsultationAvailability(): Promise<ConsultationAvailability[]> {
    return await db.select().from(consultationAvailability)
      .where(eq(consultationAvailability.isActive, true))
      .orderBy(consultationAvailability.dayOfWeek);
  }

  async createConsultationAvailability(availability: InsertConsultationAvailability): Promise<ConsultationAvailability> {
    const [newAvailability] = await db
      .insert(consultationAvailability)
      .values(availability)
      .returning();
    return newAvailability;
  }

  async updateConsultationAvailability(id: string, availability: UpdateConsultationAvailability): Promise<ConsultationAvailability> {
    const [updated] = await db
      .update(consultationAvailability)
      .set(availability)
      .where(eq(consultationAvailability.id, id))
      .returning();
    return updated;
  }

  async deleteConsultationAvailability(id: string): Promise<void> {
    await db.delete(consultationAvailability).where(eq(consultationAvailability.id, id));
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
