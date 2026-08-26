import { Hono, type Context } from "hono";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { bookmarks } from "../db/schema";
import { bookmarkCreateSchema, bookmarkUpdateSchema } from "./schemas";

function validationError(c: Context, issues: z.ZodError["issues"]) {
  return c.json(
    {
      error: {
        code: "VALIDATION_ERROR",
        message: "payload inválido",
        details: issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      },
    },
    400,
  );
}

const idParam = z.uuid();

export const bookmarkRoutes = new Hono()
  .post("/", async (c) => {
    const parsed = bookmarkCreateSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return validationError(c, parsed.error.issues);

    const [criado] = await db.insert(bookmarks).values(parsed.data).returning();
    return c.json(criado, 201);
  })
  .get("/", async (c) => {
    const lista = await db.select().from(bookmarks).orderBy(bookmarks.createdAt);
    return c.json(lista);
  })
  .get("/:id", async (c) => {
    const parsedId = idParam.safeParse(c.req.param("id"));
    if (!parsedId.success) return validationError(c, parsedId.error.issues);

    const [bookmark] = await db.select().from(bookmarks).where(eq(bookmarks.id, parsedId.data));
    if (!bookmark) {
      return c.json({ error: { code: "NOT_FOUND", message: "bookmark não encontrado" } }, 404);
    }
    return c.json(bookmark);
  })
  .patch("/:id", async (c) => {
    const parsedId = idParam.safeParse(c.req.param("id"));
    if (!parsedId.success) return validationError(c, parsedId.error.issues);

    const parsed = bookmarkUpdateSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return validationError(c, parsed.error.issues);

    const [atualizado] = await db
      .update(bookmarks)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(bookmarks.id, parsedId.data))
      .returning();
    if (!atualizado) {
      return c.json({ error: { code: "NOT_FOUND", message: "bookmark não encontrado" } }, 404);
    }
    return c.json(atualizado);
  })
  .delete("/:id", async (c) => {
    const parsedId = idParam.safeParse(c.req.param("id"));
    if (!parsedId.success) return validationError(c, parsedId.error.issues);

    const [apagado] = await db.delete(bookmarks).where(eq(bookmarks.id, parsedId.data)).returning();
    if (!apagado) {
      return c.json({ error: { code: "NOT_FOUND", message: "bookmark não encontrado" } }, 404);
    }
    return c.body(null, 204);
  });
