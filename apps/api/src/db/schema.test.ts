import { afterAll, describe, expect, it } from "bun:test";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { bookmarks, sessions, users } from "./schema";

afterAll(async () => {
  await db.delete(bookmarks);
  await db.delete(sessions);
  await db.delete(users);
});

let emailSeq = 0;
async function createUser(overrides: Partial<typeof users.$inferInsert> = {}) {
  const [user] = await db
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

describe("schema", () => {
  it("salva e busca um bookmark com dono e tags", async () => {
    const user = await createUser({ name: "Cadu", email: "cadu@example.com" });

    const [bookmark] = await db
      .insert(bookmarks)
      .values({
        userId: user.id,
        title: "Docs do Hono",
        url: "https://hono.dev",
        description: "Documentação oficial",
        tags: ["docs", "hono"],
      })
      .returning();
    if (!bookmark) throw new Error("insert não retornou bookmark");

    expect(bookmark.title).toBe("Docs do Hono");
    expect(bookmark.tags).toEqual(["docs", "hono"]);

    const rows = await db
      .select({ title: bookmarks.title, owner: users.email })
      .from(bookmarks)
      .innerJoin(users, eq(bookmarks.userId, users.id));

    const salvo = rows.find((r) => r.title === "Docs do Hono");
    expect(salvo?.owner).toBe("cadu@example.com");
  });

  it("não permite dois usuários com o mesmo email", async () => {
    await createUser({ email: "unico@example.com" });

    let duplicadoFalhou = false;
    try {
      await createUser({ name: "B", email: "unico@example.com" });
    } catch {
      duplicadoFalhou = true;
    }

    expect(duplicadoFalhou).toBe(true);
  });

  it("apaga os bookmarks quando o dono é apagado (cascade)", async () => {
    const user = await createUser({ name: "Temp", email: "temp@example.com" });

    await db.insert(bookmarks).values({
      userId: user.id,
      title: "Vai sumir",
      url: "https://example.com",
    });

    await db.delete(users).where(eq(users.email, "temp@example.com"));

    const restantes = await db.select().from(bookmarks);
    expect(
      restantes.some((b) => b.title === "Vai sumir"),
      "bookmark deveria ter sido apagado em cascata",
    ).toBe(false);
  });

  it("session referencia um usuário e expira", async () => {
    const user = await createUser({ name: "Sessão", email: "sessao@example.com" });

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);
    const [session] = await db
      .insert(sessions)
      .values({ id: "token-teste", userId: user.id, expiresAt })
      .returning();
    if (!session) throw new Error("insert não retornou session");

    expect(session.userId).toBe(user.id);
    expect(session.expiresAt.getTime()).toBe(expiresAt.getTime());
  });
});
