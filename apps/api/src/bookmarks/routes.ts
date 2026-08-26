import { Hono, type Context } from "hono";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { bookmarks, users } from "../db/schema";
import { bookmarkCreateSchema, bookmarkUpdateSchema } from "./schemas";

type Issue = z.ZodError["issues"][number];

function apiError(
  c: Context,
  status: ContentfulStatus,
  code: string,
  message: string,
  details: Issue[] = [],
) {
  return c.json({ error: { code, message, details } }, status);
}

type ContentfulStatus = 400 | 404;

async function parseBody(c: Context) {
  return c.req.json().catch(() => null);
}

function parseId(c: Context) {
  return z.uuid().safeParse(c.req.param("id"));
}

export const bookmarkRoutes = new Hono()
  .post("/", async (c) => {
    const parsed = bookmarkCreateSchema.safeParse(await parseBody(c));
    if (!parsed.success) {
      return apiError(c, 400, "VALIDATION_ERROR", "payload inválido", parsed.error.issues);
    }

    const [dono] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, parsed.data.userId));
    if (!dono) return apiError(c, 404, "USER_NOT_FOUND", "usuário não encontrado");

    const [criado] = await db.insert(bookmarks).values(parsed.data).returning();
    return c.json(criado, 201);
  })
  .get("/", async (c) => {
    const lista = await db.select().from(bookmarks).orderBy(bookmarks.createdAt);
    return c.json(lista);
  })
  .get("/:id", async (c) => {
    const id = parseId(c);
    if (!id.success) {
      return apiError(c, 400, "VALIDATION_ERROR", "payload inválido", id.error.issues);
    }

    const [bookmark] = await db.select().from(bookmarks).where(eq(bookmarks.id, id.data));
    if (!bookmark) return apiError(c, 404, "NOT_FOUND", "bookmark não encontrado");
    return c.json(bookmark);
  })
  .patch("/:id", async (c) => {
    const id = parseId(c);
    if (!id.success) {
      return apiError(c, 400, "VALIDATION_ERROR", "payload inválido", id.error.issues);
    }

    const parsed = bookmarkUpdateSchema.safeParse(await parseBody(c));
    if (!parsed.success) {
      return apiError(c, 400, "VALIDATION_ERROR", "payload inválido", parsed.error.issues);
    }

    const [atualizado] = await db
      .update(bookmarks)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(bookmarks.id, id.data))
      .returning();
    if (!atualizado) return apiError(c, 404, "NOT_FOUND", "bookmark não encontrado");
    return c.json(atualizado);
  })
  .delete("/:id", async (c) => {
    const id = parseId(c);
    if (!id.success) {
      return apiError(c, 400, "VALIDATION_ERROR", "payload inválido", id.error.issues);
    }

    const [apagado] = await db.delete(bookmarks).where(eq(bookmarks.id, id.data)).returning();
    if (!apagado) return apiError(c, 404, "NOT_FOUND", "bookmark não encontrado");
    return c.body(null, 204);
  });
