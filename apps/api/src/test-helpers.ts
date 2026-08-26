import type { db } from "./db";
import { users } from "./db/schema";

let emailSeq = 0;

export type User = typeof users.$inferSelect;

export async function createUser(
  database: typeof db,
  overrides: Partial<typeof users.$inferInsert> = {},
): Promise<User> {
  const [user] = await database
    .insert(users)
    .values({
      name: "Usuária de teste",
      email: `teste-${emailSeq++}@example.com`,
      passwordHash: "hash-falso",
      ...overrides,
    })
    .returning();
  if (!user) throw new Error("insert não retornou usuário");
  return user;
}
