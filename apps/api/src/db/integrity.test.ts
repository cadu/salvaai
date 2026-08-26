import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { bookmarks } from "./schema";
import { user } from "./auth-schema";
import { limparTabelas } from "../test-helpers";

beforeAll(limparTabelas);
afterAll(limparTabelas);

describe("integridade do banco", () => {
  it("email de usuário é único", async () => {
    await db.insert(user).values({ id: "u-1", name: "A", email: "repetida@example.com" });

    let duplicadoFalhou = false;
    try {
      await db.insert(user).values({ id: "u-2", name: "B", email: "repetida@example.com" });
    } catch {
      duplicadoFalhou = true;
    }

    expect(duplicadoFalhou).toBe(true);
  });

  it("apagar o usuário apaga os bookmarks dele (cascade)", async () => {
    const [aluna] = await db
      .insert(user)
      .values({ id: "u-temp", name: "Temp", email: "temp@example.com" })
      .returning();
    if (!aluna) throw new Error("insert não retornou usuário");

    await db.insert(bookmarks).values({
      userId: aluna.id,
      title: "Vai sumir junto",
      url: "https://example.com",
    });

    await db.delete(user).where(eq(user.id, aluna.id));

    const restantes = await db.select().from(bookmarks);
    expect(restantes.some((b) => b.title === "Vai sumir junto")).toBe(false);
  });
});
