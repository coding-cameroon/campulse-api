import { db } from "@/config/db";
import { eq, desc } from "drizzle-orm";
import { users, type NewUser, type User } from "@/db/schema";

export const userServices = {
  // CREATE USER
  async createUser(data: NewUser): Promise<User> {
    return await db.transaction(async (tx) => {
      const [user] = await tx.insert(users).values(data).returning();
      return user;
    });
  },

  //   UPDATE USER
  async updateUser(
    id: string,
    data: Partial<Pick<User, "firstName" | "lastName" | "realAvatarUrl">>,
  ): Promise<User> {
    return await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(users)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();
      return updated;
    });
  },

  //   DEACTIVATE USER
  async toggleUserActiveState(id: string, state = false): Promise<User> {
    return await db.transaction(async (tx) => {
      const [user] = await tx
        .update(users)
        .set({ isActive: state, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();
      return user;
    });
  },

  //   GET USERS
  async getUsers({ page, limit }: { page: number; limit: number }) {
    const offset = (page - 1) * limit;
    const result = await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);
    return { users: result, page, limit };
  },

  //   GET USER
  async getUser(id: string): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0] ?? null;
  },

  //   FIND USER BY CLERK ID
  async findByClerkId(clerkId: string): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);
    return result[0] ?? null;
  },

  // DELETE USER
  async deleteUser(id: string): Promise<User> {
    return await db.transaction(async (tx) => {
      const [user] = await tx.delete(users).where(eq(users.id, id));
      return user;
    });
  },
};
