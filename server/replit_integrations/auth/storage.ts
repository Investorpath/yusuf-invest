import { users, type User, type UpsertUser } from "@shared/models/auth";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { sendWelcomeEmail } from "../../email";

// Interface for auth storage operations
// (IMPORTANT) These user operations are mandatory for Replit Auth.
export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = await this.getUser(userData.id!);
    const shouldSendWelcomeEmail = !existingUser || (existingUser && !existingUser.welcomeEmailSent);
    
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
    
    if (shouldSendWelcomeEmail && user.email && !user.welcomeEmailSent) {
      const name = user.firstName || user.email.split('@')[0];
      sendWelcomeEmail(user.email, name)
        .then(async (result) => {
          if (result.success) {
            try {
              await db.update(users)
                .set({ welcomeEmailSent: true })
                .where(eq(users.id, user.id));
              console.log('Welcome email sent and flag updated for user:', user.id);
            } catch (updateErr) {
              console.error('Failed to update welcomeEmailSent flag:', updateErr);
            }
          }
        })
        .catch((err) => console.error('Failed to send welcome email:', err));
    }
    
    return user;
  }
}

export const authStorage = new AuthStorage();
