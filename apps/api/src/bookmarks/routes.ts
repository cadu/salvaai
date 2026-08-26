import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import type { Context } from "hono";
import { z } from "zod";
import { auth } from "../auth";
import { db } from "../db";
import { bookmarks } from "../db/schema";
import { bookmarkCreateSchema, bookmarkUpdateSchema } from "./schemas";

type Issue = z.ZodError["issues"][number];
type ContentfulStatus = 400 | 401 | 404;

function apiError(
  c: Context,
  status: ContentfulStatus,
  code: string,
  message: string,
  details: Issue[] = [],
) {
  return c.json({ error: { code, message, details } }, status);
}

async function parseBody(c: Context) {
  return c.req.json().catch(() => null);
}

function parseId(c: Context) {
  return z.uuid().safeParse(c.req.param("id"));
}

type Env = { Variables: { userId: string } };

export const bookmarkRoutes = new Hono<Env>()

  .use("*", async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
      return apiError(c, 401, "UNAUTHORIZED", "faça login para acessar seus bookmarks");
    }
    c.set("userId", session.user.id);
    await next();
  })

  .post("/", async (c) => {
    const parsed = bookmarkCreateSchema.safeParse(await parseBody(c));
    if (!parsed.success) {
      return apiError(c, 400, "VALIDATION_ERROR", "payload inválido", parsed.error.issues);
    }

    const [criado] = await db
      .insert(bookmarks)
      .values({ ...parsed.data, userId: c.get("userId") })
      .returning();
    return c.json(criado, 201);
  })

  .get("/", async (c) => {
    const meus = await db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.userId, c.get("userId")))
      .orderBy(bookmarks.createdAt);
    return c.json(meus);
  })

  .get("/:id", async (c) => {
    const id = parseId(c);
    if (!id.success) {
      return apiError(c, 400, "VALIDATION_ERROR", "payload inválido", id.error.issues);
    }

    const [bookmark] = await db
      .select()
      .from(bookmarks)
      .where(and(eq(bookmarks.id, id.data), eq(bookmarks.userId, c.get("userId"))));
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
      .where(and(eq(bookmarks.id, id.data), eq(bookmarks.userId, c.get("userId"))))
      .returning();
    if (!atualizado) return apiError(c, 404, "NOT_FOUND", "bookmark não encontrado");
    return c.json(atualizado);
  })

  .delete("/:id", async (c) => {
    const id = parseId(c);
    if (!id.success) {
      return apiError(c, 400, "VALIDATION_ERROR", "payload inválido", id.error.issues);
    }

    const [apagado] = await db
      .delete(bookmarks)
      .where(and(eq(bookmarks.id, id.data), eq(bookmarks.userId, c.get("userId"))))
      .returning();
    if (!apagado) return apiError(c, 404, "NOT_FOUND", "bookmark não encontrado");
    return c.body(null, 204);
  });
