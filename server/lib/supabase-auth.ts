import { createClient } from "@supabase/supabase-js";
import type { Request, Response, NextFunction, Express } from "express";
import { storage } from "../storage";
import { sendWelcomeEmail } from "../email";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

// Server-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ message: "Unauthorized: Invalid session", error: error?.message });
  }

  // Attach user to request
  (req as any).user = user;
  
  // Sync with our public users table if needed
  let dbUser = await storage.getUser(user.id);
  
  if (!dbUser) {
    // First time seeing this user via Supabase
    dbUser = await storage.upsertUser({
      id: user.id,
      email: user.email!,
      firstName: (user.user_metadata as any)?.first_name || (user.user_metadata as any)?.firstName || "",
      lastName: (user.user_metadata as any)?.last_name || (user.user_metadata as any)?.lastName || "",
      profileImageUrl: (user.user_metadata as any)?.avatar_url || "",
    });
  }

  // Send welcome email if not sent before
  if (dbUser && !dbUser.welcomeEmailSent) {
    try {
      const name = dbUser.firstName || "User";
      await sendWelcomeEmail(dbUser.email!, name);
      dbUser = await storage.updateUser(dbUser.id, { welcomeEmailSent: true });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }
  }

  (req as any).dbUser = dbUser;
  next();
}

export async function adminOnly(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).dbUser;
  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  next();
}

export function setupAuth(app: Express) {
  // In a Supabase setup, the client usually manages the session.
  // We just need the middleware to protect API routes.
  // We can also handle session cookies if strictly necessary, but Bearer tokens are more common for Supabase + Express.
}

export function registerAuthRoutes(app: Express) {
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", isAuthenticated, adminOnly, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id/role", isAuthenticated, adminOnly, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const updatedUser = await storage.updateUser(id, { role });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });
}
