import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { app } from "../app";
import { db } from "../db";
import { bookmarks, sessions, users } from "../db/schema";
import { createUser, type User } from "../test-helpers";

async function createBookmark(userId: string, overrides: Record<string, unknown> = {}) {
  const res = await app.request("/api/bookmarks", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ userId, title: "Docs do Hono", url: "https://hono.dev", ...overrides }),
  });
  return (await res.json()) as { id: string; [k: string]: unknown };
}

beforeAll(async () => {
  await db.delete(bookmarks);
  await db.delete(sessions);
  await db.delete(users);
});

afterAll(async () => {
  await db.delete(bookmarks);
  await db.delete(sessions);
  await db.delete(users);
});

describe("POST /api/bookmarks", () => {
  let user: User;

  beforeAll(async () => {
    user = await createUser(db);
  });

  it("cria um bookmark e devolve 201 com o recurso", async () => {
    const res = await app.request("/api/bookmarks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        title: "React Docs",
        url: "https://react.dev",
        description: "Documentação do React",
        tags: ["react", "docs"],
      }),
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as {
      id: string;
      title: string;
      url: string;
      tags: string[];
    };
    expect(body.title).toBe("React Docs");
    expect(body.url).toBe("https://react.dev");
    expect(body.tags).toEqual(["react", "docs"]);
  });

  it("rejeita payload sem título com 400 e formato de erro único", async () => {
    const res = await app.request("/api/bookmarks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId: user.id, url: "https://react.dev" }),
    });

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: { code: string; message: string } };
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.message).toBeString();
  });

  it("rejeita URL inválida com 400", async () => {
    const res = await app.request("/api/bookmarks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId: user.id, title: "X", url: "não é url" }),
    });

    expect(res.status).toBe(400);
  });

  it("rejeita JSON malformado com 400", async () => {
    const res = await app.request("/api/bookmarks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{isso não é json",
    });

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: { code: string; message: string } };
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("GET /api/bookmarks", () => {
  it("lista os bookmarks criados", async () => {
    const user = await createUser(db);
    await createBookmark(user.id, { title: "Primeiro" });
    await createBookmark(user.id, { title: "Segundo" });

    const res = await app.request("/api/bookmarks");
    expect(res.status).toBe(200);

    const lista = (await res.json()) as { title: string }[];
    const titulos = lista.map((b) => b.title);
    expect(titulos).toContain("Primeiro");
    expect(titulos).toContain("Segundo");
  });
});

describe("GET /api/bookmarks/:id", () => {
  it("busca por id existente", async () => {
    const user = await createUser(db);
    const criado = await createBookmark(user.id);

    const res = await app.request(`/api/bookmarks/${criado.id}`);
    expect(res.status).toBe(200);
    expect(((await res.json()) as { title: string }).title).toBe("Docs do Hono");
  });

  it("devolve 404 com formato de erro único para id inexistente", async () => {
    const res = await app.request("/api/bookmarks/00000000-0000-0000-0000-000000000000");
    expect(res.status).toBe(404);

    const body = (await res.json()) as { error: { code: string; message: string } };
    expect(body.error.code).toBe("NOT_FOUND");
  });

  it("devolve 400 para id que não é uuid", async () => {
    const res = await app.request("/api/bookmarks/não-é-uuid");
    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/bookmarks/:id", () => {
  it("atualiza título e tags", async () => {
    const user = await createUser(db);
    const criado = await createBookmark(user.id);

    const res = await app.request(`/api/bookmarks/${criado.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Novo título", tags: ["atualizado"] }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { title: string; tags: string[]; url: string };
    expect(body.title).toBe("Novo título");
    expect(body.tags).toEqual(["atualizado"]);
    expect(body.url).toBe("https://hono.dev");
  });

  it("rejeita atualização com campo inválido", async () => {
    const user = await createUser(db);
    const criado = await createBookmark(user.id);

    const res = await app.request(`/api/bookmarks/${criado.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "" }),
    });

    expect(res.status).toBe(400);
  });

  it("devolve 404 ao atualizar id inexistente", async () => {
    const res = await app.request("/api/bookmarks/00000000-0000-0000-0000-000000000000", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Nada" }),
    });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/bookmarks/:id", () => {
  it("apaga e depois devolve 404 no GET", async () => {
    const user = await createUser(db);
    const criado = await createBookmark(user.id);

    const del = await app.request(`/api/bookmarks/${criado.id}`, { method: "DELETE" });
    expect(del.status).toBe(204);

    const get = await app.request(`/api/bookmarks/${criado.id}`);
    expect(get.status).toBe(404);
  });

  it("devolve 404 ao apagar id inexistente", async () => {
    const res = await app.request("/api/bookmarks/00000000-0000-0000-0000-000000000000", {
      method: "DELETE",
    });
    expect(res.status).toBe(404);
  });
});
