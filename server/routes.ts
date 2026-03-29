import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getAuthUrl, exchangeCode, getGmailEmail, extractTransactionsFromGmail } from "./lib/gmail-extractor";
import { db } from "./db";
import { gmailConnections, transactions } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { setupAuth, registerAuthRoutes, isAuthenticated, adminOnly } from "./lib/supabase-auth";
import { 
  insertWorkshopRequestSchema,
  insertConsultationBookingSchema,
  insertCourseSchema,
  updateCourseSchema,
  insertEnrollmentSchema,
  updateWorkshopRequestSchema,
  insertWorkshopNoteSchema,
  insertPaymentSchema,
  insertConsultationTypeSchema,
  updateConsultationTypeSchema,
  insertConsultationAvailabilitySchema,
  updateConsultationAvailabilitySchema,
} from "@shared/schema";
import {
  sendEnrollmentConfirmation,
  sendConsultationConfirmation,
  sendWorkshopInquiryNotification,
  sendPaymentConfirmation,
  sendAdminPaymentNotification,
  sendBookingReceived,
} from "./email";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";

function generateReferenceCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `YI-${timestamp}-${random}`;
}

const BANK_DETAILS = {
  bankName: "National Bank of Oman (NBO)",
  accountHolder: "Yoosuf Al Rahbi",
  iban: "OM880180010470208185001",
  swiftCode: "NBOMOMRXXXX",
  mobileNumber: "95909698",
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Setup authentication first (before other routes)
  await setupAuth(app);
  registerAuthRoutes(app);
  
  // Register object storage routes for file uploads
  registerObjectStorageRoutes(app);
  
  // Test email endpoint (for debugging)
  app.get("/api/test-email", isAuthenticated, async (req: any, res) => {
    try {
      const userEmail = req.user?.email;
      if (!userEmail) {
        return res.status(400).json({ error: "User email not found" });
      }
      const result = await sendEnrollmentConfirmation(userEmail, "Test User", "Test Course");
      res.json({ success: result.success, result });
    } catch (error: any) {
      console.error("Test email error:", error);
      res.status(500).json({ error: error?.message || "Email test failed" });
    }
  });

  // Workshop Requests API
  app.post("/api/workshop-requests", async (req, res) => {
    try {
      const data = insertWorkshopRequestSchema.parse(req.body);
      const request = await storage.createWorkshopRequest(data);
      
      sendWorkshopInquiryNotification(
        data.organizationName,
        data.contactName,
        data.email,
        data.message
      ).catch(console.error);
      
      res.json(request);
    } catch (error) {
      res.status(400).json({ error: "Invalid request data" });
    }
  });

  app.get("/api/workshop-requests", async (req, res) => {
    try {
      const requests = await storage.getAllWorkshopRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workshop requests" });
    }
  });

  app.get("/api/workshop-requests/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const request = await storage.getWorkshopRequest(id);
      if (!request) {
        return res.status(404).json({ error: "Workshop request not found" });
      }
      res.json(request);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workshop request" });
    }
  });

  app.patch("/api/workshop-requests/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = updateWorkshopRequestSchema.parse(req.body);
      const updated = await storage.updateWorkshopRequest(id, data);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update workshop request" });
    }
  });

  app.get("/api/workshop-requests/:id/notes", async (req, res) => {
    try {
      const { id } = req.params;
      const notes = await storage.getWorkshopNotes(id);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  app.post("/api/workshop-requests/:id/notes", async (req, res) => {
    try {
      const { id } = req.params;
      const data = insertWorkshopNoteSchema.parse({ ...req.body, workshopRequestId: id });
      const note = await storage.addWorkshopNote(data);
      res.json(note);
    } catch (error) {
      res.status(400).json({ error: "Invalid note data" });
    }
  });

  // Consultation Bookings API
  async function createConsultationBookingHandler(req: any, res: any) {
    try {
      const data = insertConsultationBookingSchema.parse(req.body);

      // Conflict check: reject if same date+time already has a non-rejected booking
      const existing = await storage.getAllConsultationBookings();
      const conflict = existing.find(
        (b: any) =>
          b.date === data.date &&
          b.time === data.time &&
          b.status !== "rejected" &&
          b.status !== "cancelled"
      );
      if (conflict) {
        return res.status(409).json({ error: "This time slot is already booked. Please choose another time." });
      }

      const booking = await storage.createConsultationBooking(data);

      // Send booking received email (fire and forget)
      if (data.email) {
        const referenceCode = `YI-${Date.now().toString(36).toUpperCase().slice(-5)}`;
        sendBookingReceived(
          data.email,
          `${data.firstName} ${data.lastName}`.trim() || data.email,
          data.date,
          data.time,
          data.sessionType,
          referenceCode
        ).catch(console.error);
      }

      res.json(booking);
    } catch (error) {
      res.status(400).json({ error: "Invalid booking data" });
    }
  }

  app.post("/api/consultations", createConsultationBookingHandler);
  // Alias used by the booking UI
  app.post("/api/consultation-bookings", createConsultationBookingHandler);

  // Public: Book consultation + create payment in one call (no auth required)
  app.post("/api/consultation-payment", async (req, res) => {
    try {
      const {
        sessionType, date, time, firstName, lastName, email, notes,
        mode, location, method, amount, currency,
      } = req.body;

      if (!sessionType || !date || !time || !firstName || !email || !method || !amount) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Conflict check
      const existing = await storage.getAllConsultationBookings();
      const conflict = existing.find(
        (b: any) =>
          b.date === date &&
          b.time === time &&
          b.status !== "rejected" &&
          b.status !== "cancelled"
      );
      if (conflict) {
        return res.status(409).json({ error: "This time slot is already booked. Please choose another time." });
      }

      // Create booking
      const booking = await storage.createConsultationBooking({
        sessionType,
        date,
        time,
        firstName,
        lastName: lastName || "",
        email,
        notes: notes || "",
        mode: mode || "online",
        location: location || null,
      });

      // Create payment record
      const referenceCode = generateReferenceCode();
      const userName = `${firstName} ${lastName || ""}`.trim();
      const payment = await storage.createPayment({
        referenceCode,
        userEmail: email,
        userName,
        amount,
        currency: currency || "OMR",
        method,
        productType: "consultation",
        courseId: null,
        consultationBookingId: booking.id,
        sessionType,
      });

      // Get consultation type name for email
      const consultationType = await storage.getConsultationType(sessionType);
      const typeName = consultationType?.titleAr || consultationType?.title || sessionType;

      // Fire-and-forget emails
      sendBookingReceived(email, userName, date, time, typeName, referenceCode).catch(console.error);
      sendAdminPaymentNotification(
        userName, email, amount, currency || "OMR",
        referenceCode, "consultation", typeName
      ).catch(console.error);

      res.json({ payment, bankDetails: BANK_DETAILS, referenceCode });
    } catch (error) {
      console.error("Consultation payment error:", error);
      res.status(500).json({ error: "Failed to process booking" });
    }
  });

  app.get("/api/consultations", async (req, res) => {
    try {
      const bookings = await storage.getAllConsultationBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.patch("/api/consultations/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await storage.updateConsultationStatus(id, status);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update status" });
    }
  });

  // Courses API
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getAllCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch courses" });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const course = await storage.getCourse(id);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch course" });
    }
  });

  app.post("/api/courses", async (req, res) => {
    try {
      const data = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(data);
      res.json(course);
    } catch (error) {
      res.status(400).json({ error: "Invalid course data" });
    }
  });

  app.patch("/api/courses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = updateCourseSchema.parse(req.body);
      const course = await storage.updateCourse(id, data);
      res.json(course);
    } catch (error) {
      res.status(400).json({ error: "Invalid course data" });
    }
  });

  app.delete("/api/courses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCourse(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete course" });
    }
  });

  // Enrollments API (protected - users can only enroll themselves)
  app.post("/api/enrollments", isAuthenticated, async (req: any, res) => {
    try {
      const userEmail = req.user?.email;
      if (!userEmail) {
        return res.status(400).json({ error: "User email not found" });
      }
      const studentName = req.user?.user_metadata?.first_name 
        ? `${req.user.user_metadata.first_name} ${req.user.user_metadata.last_name || ''}`.trim()
        : userEmail;
      
      const data = insertEnrollmentSchema.parse({
        ...req.body,
        studentEmail: userEmail,
        studentName,
      });
      const existing = await storage.getEnrollment(data.courseId, userEmail);
      if (existing) {
        return res.status(409).json({ error: "Already enrolled in this course" });
      }
      const enrollment = await storage.createEnrollment(data);
      
      const course = await storage.getCourse(data.courseId);
      if (course) {
        sendEnrollmentConfirmation(userEmail, studentName, course.title).catch(console.error);
      }
      
      res.json(enrollment);
    } catch (error) {
      res.status(400).json({ error: "Invalid enrollment data" });
    }
  });

  app.get("/api/enrollments", isAuthenticated, async (req: any, res) => {
    try {
      const userEmail = req.user?.email;
      if (!userEmail) {
        return res.status(400).json({ error: "User email not found" });
      }
      const enrollments = await storage.getEnrollmentsByEmail(userEmail);
      res.json(enrollments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch enrollments" });
    }
  });

  app.get("/api/courses/:id/enrollments", async (req, res) => {
    try {
      const { id } = req.params;
      const enrollments = await storage.getEnrollmentsByCourse(id);
      res.json(enrollments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch course enrollments" });
    }
  });

  app.get("/api/courses/:courseId/enrollment", isAuthenticated, async (req: any, res) => {
    try {
      const { courseId } = req.params;
      const userEmail = req.user?.email;
      if (!userEmail) {
        return res.status(400).json({ error: "User email not found" });
      }
      const enrollment = await storage.getEnrollment(courseId, userEmail);
      res.json(enrollment || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to check enrollment" });
    }
  });

  app.patch("/api/enrollments/:id/progress", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { progress, completedLessons } = req.body;
      const updated = await storage.updateEnrollmentProgress(id, progress, completedLessons);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update progress" });
    }
  });

  // Learning Paths API
  app.get("/api/learning-paths", async (req, res) => {
    try {
      const paths = await storage.getAllLearningPaths();
      res.json(paths);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch learning paths" });
    }
  });

  app.get("/api/learning-paths/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const path = await storage.getLearningPath(id);
      if (!path) {
        return res.status(404).json({ error: "Learning path not found" });
      }
      const pathCourses = await storage.getLearningPathCourses(id);
      const courseDetails = await Promise.all(
        pathCourses.map(async (pc) => {
          const course = await storage.getCourse(pc.courseId);
          return { ...pc, course };
        })
      );
      res.json({ ...path, courses: courseDetails });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch learning path" });
    }
  });

  // Payment API - Bank Details
  app.get("/api/payment/bank-details", (req, res) => {
    res.json(BANK_DETAILS);
  });

  // Create payment (for course or consultation)
  app.post("/api/payments", isAuthenticated, async (req: any, res) => {
    try {
      const userEmail = req.user?.email;
      if (!userEmail) {
        return res.status(400).json({ error: "User email not found" });
      }
      const userName = req.user?.user_metadata?.first_name 
        ? `${req.user.user_metadata.first_name} ${req.user.user_metadata.last_name || ''}`.trim()
        : userEmail;

      const { productType, courseId, sessionType, method, amount, currency, consultationDate, consultationTime, notes } = req.body;
      
      if (!productType || !method || !amount) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (productType === "course" && courseId) {
        const existing = await storage.getPaymentForCourse(courseId, userEmail);
        if (existing) {
          return res.json({ payment: existing, bankDetails: BANK_DETAILS });
        }
      }

      let consultationBookingId = null;
      
      if (productType === "consultation") {
        const [firstName, ...lastNameParts] = userName.split(' ');
        const { mode, location } = req.body;
        const booking = await storage.createConsultationBooking({
          sessionType: sessionType || "clarity",
          date: consultationDate || "",
          time: consultationTime || "",
          firstName: firstName || userName,
          lastName: lastNameParts.join(' ') || "",
          email: userEmail,
          notes: notes || "",
          mode: mode || "online",
          location: location || null,
        });
        consultationBookingId = booking.id;
      }

      const referenceCode = generateReferenceCode();
      
      const payment = await storage.createPayment({
        referenceCode,
        userEmail,
        userName,
        amount,
        currency: currency || "OMR",
        method,
        productType,
        courseId: courseId || null,
        consultationBookingId,
        sessionType: sessionType || null,
      });

      // Get product name for admin notification
      let productName = "Unknown";
      if (productType === "course" && courseId) {
        const course = await storage.getCourse(courseId);
        productName = course?.titleAr || course?.title || "Course";
      } else if (productType === "consultation" && sessionType) {
        const consultationType = await storage.getConsultationType(sessionType);
        productName = consultationType?.titleAr || consultationType?.title || sessionType;
      }

      // Send admin notification email
      sendAdminPaymentNotification(
        userName,
        userEmail,
        amount,
        currency || "OMR",
        referenceCode,
        productType,
        productName
      ).catch(err => console.error("Failed to send admin notification:", err));

      res.json({ payment, bankDetails: BANK_DETAILS, referenceCode: payment.referenceCode });
    } catch (error) {
      console.error("Payment creation error:", error);
      res.status(400).json({ error: "Failed to create payment" });
    }
  });

  // Get user's payments
  app.get("/api/payments/my", isAuthenticated, async (req: any, res) => {
    try {
      const userEmail = req.user?.email;
      if (!userEmail) {
        return res.status(400).json({ error: "User email not found" });
      }
      const payments = await storage.getPaymentsByEmail(userEmail);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });

  // Check payment status for a course
  app.get("/api/payments/course/:courseId", isAuthenticated, async (req: any, res) => {
    try {
      const { courseId } = req.params;
      const userEmail = req.user?.email;
      if (!userEmail) {
        return res.status(400).json({ error: "User email not found" });
      }
      const payment = await storage.getPaymentForCourse(courseId, userEmail);
      res.json(payment || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to check payment" });
    }
  });

  // Update payment with transfer reference (user submits proof)
  app.patch("/api/payments/:id/submit", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { transferReference, proofUrl } = req.body;
      
      const payment = await storage.getPayment(id);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      const userEmail = req.user?.email;
      if (payment.userEmail !== userEmail) {
        return res.status(403).json({ error: "Not authorized" });
      }

      const updated = await storage.updatePayment(id, { transferReference, proofUrl });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update payment" });
    }
  });

  // Admin: Get all payments
  app.get("/api/admin/payments", isAuthenticated, adminOnly, async (req, res) => {
    try {
      const payments = await storage.getAllPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });

  // Admin: Get pending payments
  app.get("/api/admin/payments/pending", isAuthenticated, adminOnly, async (req, res) => {
    try {
      const payments = await storage.getPendingPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending payments" });
    }
  });

  // Admin: Approve payment
  app.post("/api/admin/payments/:id/approve", isAuthenticated, adminOnly, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const adminName = req.user?.user_metadata?.first_name || "Admin";
      
      const payment = await storage.getPayment(id);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      const approved = await storage.approvePayment(id, adminName, notes);
      
      if (payment.productType === "course" && payment.courseId) {
        const existing = await storage.getEnrollment(payment.courseId, payment.userEmail);
        if (!existing) {
          await storage.createEnrollment({
            courseId: payment.courseId,
            studentEmail: payment.userEmail,
            studentName: payment.userName,
          });
          const course = await storage.getCourse(payment.courseId);
          if (course) {
            sendEnrollmentConfirmation(payment.userEmail, payment.userName, course.title).catch(console.error);
          }
        }
      } else if (payment.productType === "consultation" && payment.consultationBookingId) {
        await storage.updateConsultationStatus(payment.consultationBookingId, "paid");
        const booking = await storage.getConsultationBooking(payment.consultationBookingId);
        if (booking) {
          sendConsultationConfirmation(
            payment.userEmail,
            payment.userName,
            booking.date,
            booking.time,
            booking.sessionType
          ).catch(console.error);
        }
      }

      sendPaymentConfirmation(
        payment.userEmail,
        payment.userName,
        payment.amount,
        payment.currency,
        payment.referenceCode,
        payment.productType
      ).catch(console.error);

      res.json(approved);
    } catch (error) {
      console.error("Approval error:", error);
      res.status(500).json({ error: "Failed to approve payment" });
    }
  });

  // Admin: Reject payment
  app.post("/api/admin/payments/:id/reject", isAuthenticated, adminOnly, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const adminName = req.user?.user_metadata?.first_name || "Admin";
      
      const rejected = await storage.rejectPayment(id, adminName, notes);
      res.json(rejected);
    } catch (error) {
      res.status(500).json({ error: "Failed to reject payment" });
    }
  });

  // Admin: Dashboard Stats
  app.get("/api/admin/stats", isAuthenticated, adminOnly, async (req, res) => {
    try {
      const [workshopReqs, consultations, allCourses, allPayments] = await Promise.all([
        storage.getAllWorkshopRequests(),
        storage.getAllConsultationBookings(),
        storage.getAllCourses(),
        storage.getAllPayments(),
      ]);

      const activeCourses = allCourses.filter((c: any) => c.status === "published").length;
      const draftCourses = allCourses.filter((c: any) => c.status !== "published").length;

      const approvedPayments = allPayments.filter((p: any) => p.status === "approved");
      const totalRevenue = approvedPayments.reduce((sum: number, p: any) => sum + parseFloat(p.amount || "0"), 0);
      const pendingPayments = allPayments.filter((p: any) => p.status === "pending").length;

      // Weekly activity: count requests+consultations created in last 7 days by day
      const now = new Date();
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const weeklyMap: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        weeklyMap[dayNames[d.getDay()]] = 0;
      }
      const allActivity = [
        ...workshopReqs.map((r: any) => r.createdAt),
        ...consultations.map((c: any) => c.createdAt),
      ];
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      allActivity.forEach((ts: any) => {
        if (!ts) return;
        const d = new Date(ts);
        if (d >= sevenDaysAgo) {
          const key = dayNames[d.getDay()];
          if (key in weeklyMap) weeklyMap[key]++;
        }
      });
      const weeklyData = Object.entries(weeklyMap).map(([name, requests]) => ({ name, requests }));

      // Recent activity: last 5 items across workshop requests + consultations
      const recentWorkshop = workshopReqs.slice(-3).reverse().map((r: any) => ({
        type: "workshop",
        label: r.organizationName || r.contactName,
        sub: "Workshop Inquiry",
        time: r.createdAt,
        initials: ((r.organizationName || r.contactName || "?").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()),
      }));
      const recentConsult = consultations.slice(-3).reverse().map((c: any) => ({
        type: "consultation",
        label: `${c.firstName || ""} ${c.lastName || ""}`.trim() || c.email,
        sub: "Consultation Booking",
        time: c.createdAt,
        initials: (`${c.firstName || "?"} ${c.lastName || ""}`.trim().split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()),
      }));
      const recentActivity = [...recentWorkshop, ...recentConsult]
        .sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime())
        .slice(0, 5);

      res.json({
        totalRequests: workshopReqs.length + consultations.length,
        activeCourses,
        draftCourses,
        totalRevenue: totalRevenue.toFixed(3),
        pendingPayments,
        weeklyData,
        recentActivity,
      });
    } catch (error) {
      console.error("Stats error:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Consultation Types API (public - for customers)
  app.get("/api/consultation-types", async (req, res) => {
    try {
      const types = await storage.getActiveConsultationTypes();
      res.json(types);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch consultation types" });
    }
  });

  // Admin: Consultation Types Management
  app.get("/api/admin/consultation-types", isAuthenticated, adminOnly, async (req, res) => {
    try {
      const types = await storage.getAllConsultationTypes();
      res.json(types);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch consultation types" });
    }
  });

  app.post("/api/admin/consultation-types", isAuthenticated, adminOnly, async (req, res) => {
    try {
      const data = insertConsultationTypeSchema.parse(req.body);
      const type = await storage.createConsultationType(data);
      res.json(type);
    } catch (error) {
      res.status(400).json({ error: "Invalid consultation type data" });
    }
  });

  app.patch("/api/admin/consultation-types/:id", isAuthenticated, adminOnly, async (req, res) => {
    try {
      const { id } = req.params;
      const data = updateConsultationTypeSchema.parse(req.body);
      const type = await storage.updateConsultationType(id, data);
      res.json(type);
    } catch (error) {
      res.status(400).json({ error: "Invalid consultation type data" });
    }
  });

  app.delete("/api/admin/consultation-types/:id", isAuthenticated, adminOnly, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteConsultationType(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete consultation type" });
    }
  });

  // Consultation Availability Routes (Public)
  app.get("/api/consultation-availability", async (req, res) => {
    try {
      const availability = await storage.getActiveConsultationAvailability();
      res.json(availability);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch consultation availability" });
    }
  });

  // Consultation Availability Routes (Admin)
  app.get("/api/admin/consultation-availability", async (req, res) => {
    try {
      const availability = await storage.getAllConsultationAvailability();
      res.json(availability);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch consultation availability" });
    }
  });

  app.post("/api/admin/consultation-availability", async (req, res) => {
    try {
      const data = insertConsultationAvailabilitySchema.parse(req.body);
      const availability = await storage.createConsultationAvailability(data);
      res.json(availability);
    } catch (error) {
      res.status(400).json({ error: "Invalid consultation availability data" });
    }
  });

  app.patch("/api/admin/consultation-availability/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const data = updateConsultationAvailabilitySchema.parse(req.body);
      const availability = await storage.updateConsultationAvailability(id, data);
      res.json(availability);
    } catch (error) {
      res.status(400).json({ error: "Invalid consultation availability data" });
    }
  });

  app.delete("/api/admin/consultation-availability/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteConsultationAvailability(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete consultation availability" });
    }
  });

  // ── Gmail Transaction Tracker ──────────────────────────────────────────────

  // Step 1: Generate Google OAuth URL (user ID encoded in state param)
  app.get("/api/gmail/auth", isAuthenticated, (req: any, res) => {
    try {
      const url = getAuthUrl(req.user.id);
      res.json({ url });
    } catch {
      res.status(500).json({ error: "Failed to generate auth URL. Check GOOGLE_CLIENT_ID is set." });
    }
  });

  // Step 2: OAuth callback — no auth middleware; user ID recovered from state
  app.get("/api/gmail/callback", async (req: any, res) => {
    const { code, state, error } = req.query as { code?: string; state?: string; error?: string };

    if (error) return res.redirect("/gmail-tracker?error=auth_denied");
    if (!code || !state) return res.redirect("/gmail-tracker?error=missing_params");

    let userId: string;
    try {
      userId = Buffer.from(state, "base64url").toString("utf-8");
    } catch {
      return res.redirect("/gmail-tracker?error=invalid_state");
    }

    try {
      const tokens = await exchangeCode(code);
      const accessToken = tokens.access_token!;
      const refreshToken = tokens.refresh_token || null;
      const expiresAt = tokens.expiry_date ? new Date(tokens.expiry_date) : null;

      const gmailEmail = await getGmailEmail(accessToken, refreshToken);

      await db
        .insert(gmailConnections)
        .values({ userId, gmailEmail, accessToken, refreshToken, expiresAt })
        .onConflictDoUpdate({
          target: gmailConnections.userId,
          set: { gmailEmail, accessToken, refreshToken, expiresAt, updatedAt: new Date() },
        });

      res.redirect("/gmail-tracker?connected=1");
    } catch (err: any) {
      console.error("Gmail OAuth callback error:", err);
      res.redirect("/gmail-tracker?error=auth_failed");
    }
  });

  // Check connection status
  app.get("/api/gmail/status", isAuthenticated, async (req: any, res) => {
    const [conn] = await db
      .select({ gmailEmail: gmailConnections.gmailEmail })
      .from(gmailConnections)
      .where(eq(gmailConnections.userId, req.user.id))
      .limit(1);
    res.json({ connected: !!conn, gmailEmail: conn?.gmailEmail || null });
  });

  // Disconnect Gmail
  app.delete("/api/gmail/disconnect", isAuthenticated, async (req: any, res) => {
    await db.delete(gmailConnections).where(eq(gmailConnections.userId, req.user.id));
    res.json({ ok: true });
  });

  // Run extraction — fetch emails + parse with Claude, store new transactions
  app.post("/api/gmail/sync", isAuthenticated, async (req: any, res) => {
    const [conn] = await db
      .select()
      .from(gmailConnections)
      .where(eq(gmailConnections.userId, req.user.id))
      .limit(1);

    if (!conn) return res.status(400).json({ error: "Gmail not connected" });

    try {
      const extracted = await extractTransactionsFromGmail(conn.accessToken, conn.refreshToken);

      if (extracted.length === 0) {
        return res.json({ inserted: 0, total: 0 });
      }

      // Get existing emailIds to deduplicate
      const existingRows = await db
        .select({ emailId: transactions.emailId })
        .from(transactions)
        .where(eq(transactions.userId, req.user.id));
      const existingIds = new Set(existingRows.map((r) => r.emailId));

      const newTxns = extracted.filter((t) => !existingIds.has(t.emailId));

      if (newTxns.length > 0) {
        await db.insert(transactions).values(
          newTxns.map((t) => ({
            userId: req.user.id,
            emailId: t.emailId,
            merchant: t.merchant,
            amount: String(t.amount),
            currency: t.currency,
            date: t.date,
            category: t.category,
          }))
        );
      }

      const allTxns = await db
        .select()
        .from(transactions)
        .where(eq(transactions.userId, req.user.id))
        .orderBy(transactions.date);

      res.json({ inserted: newTxns.length, total: allTxns.length, transactions: allTxns });
    } catch (err: any) {
      console.error("Gmail sync error:", err);
      res.status(500).json({ error: "Sync failed: " + err.message });
    }
  });

  // Get stored transactions
  app.get("/api/gmail/transactions", isAuthenticated, async (req: any, res) => {
    const rows = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, req.user.id))
      .orderBy(transactions.date);
    res.json(rows);
  });

  // Delete a single transaction
  app.delete("/api/gmail/transactions/:id", isAuthenticated, async (req: any, res) => {
    await db
      .delete(transactions)
      .where(and(eq(transactions.id, req.params.id), eq(transactions.userId, req.user.id)));
    res.json({ ok: true });
  });

  return httpServer;
}
