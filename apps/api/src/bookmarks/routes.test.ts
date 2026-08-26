import { beforeAll, describe, expect, it } from "bun:test";
import { app } from "../app";
import { limparTabelas, signUp, type UsuarioLogado } from "../test-helpers";

beforeAll(limparTabelas);

type Bookmark = {
  id: string;
  title: string;
  url: string;
  tags: string[];
  [k: string]: unknown;
};

async function json(method: string, path: string, cookie: string, body?: Record<string, unknown>) {
  return app.request(path, {
    method,
    headers: { "content-type": "application/json", cookie },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function post(cookie: string, body: Record<string, unknown>) {
  return json("POST", "/api/bookmarks", cookie, body);
}

function patch(id: string, cookie: string, body: Record<string, unknown>) {
  return json("PATCH", `/api/bookmarks/${id}`, cookie, body);
}

async function criarBookmark(quem: UsuarioLogado, overrides: Record<string, unknown> = {}) {
  const res = await post(quem.cookie, {
    title: "Docs do Hono",
    url: "https://hono.dev",
    ...overrides,
  });
  expect(res.status).toBe(201);
  return (await res.json()) as Bookmark;
}

describe("proteção", () => {
  it("exige login: sem cookie é 401", async () => {
    for (const [method, path] of [
      ["GET", "/api/bookmarks"],
      ["POST", "/api/bookmarks"],
      ["GET", "/api/bookmarks/00000000-0000-0000-0000-000000000000"],
    ] as const) {
      const res = await app.request(path, { method });
      expect(res.status).toBe(401);
    }
  });
});

describe("POST /api/bookmarks", () => {
  it("cria bookmark com o dono vindo da sessão (não do payload)", async () => {
    const aluna = await signUp();

    const res = await post(aluna.cookie, {
      title: "React Docs",
      url: "https://react.dev",
      description: "Documentação do React",
      tags: ["react", "docs"],
      userId: "00000000-0000-0000-0000-000000000099",
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as Bookmark & { userId: string };
    expect(body.title).toBe("React Docs");
    expect(body.tags).toEqual(["react", "docs"]);
    expect(body.userId).toBe(aluna.id);
  });

  it("rejeita URL inválida com 400 e formato de erro único", async () => {
    const aluna = await signUp();

    const res = await post(aluna.cookie, { title: "X", url: "não é url" });

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: { code: string; details: unknown[] } };
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.details.length).toBeGreaterThan(0);
  });

  it("rejeita JSON malformado com 400", async () => {
    const aluna = await signUp();

    const res = await app.request("/api/bookmarks", {
      method: "POST",
      headers: { "content-type": "application/json", cookie: aluna.cookie },
      body: "{isso não é json",
    });

    expect(res.status).toBe(400);
  });
});

describe("GET /api/bookmarks", () => {
  it("lista só os bookmarks do usuário logado", async () => {
    const ana = await signUp();
    const bruno = await signUp();

    await criarBookmark(ana, { title: "Da Ana" });
    await criarBookmark(bruno, { title: "Do Bruno" });

    const res = await json("GET", "/api/bookmarks", ana.cookie);
    expect(res.status).toBe(200);

    const lista = (await res.json()) as Bookmark[];
    const titulos = lista.map((b) => b.title);
    expect(titulos).toContain("Da Ana");
    expect(titulos).not.toContain("Do Bruno");
  });
});

describe("isolamento entre usuários", () => {
  it("outra pessoa recebe 404 ao buscar, atualizar ou apagar bookmark alheio", async () => {
    const dona = await signUp();
    const intrusa = await signUp();
    const bookmark = await criarBookmark(dona);

    for (const [method, corpo] of [
      ["GET", undefined],
      ["PATCH", { title: "Hackeado" }],
      ["DELETE", undefined],
    ] as const) {
      const res = await app.request(`/api/bookmarks/${bookmark.id}`, {
        method,
        headers: { "content-type": "application/json", cookie: intrusa.cookie },
        body: corpo ? JSON.stringify(corpo) : undefined,
      });
      expect(res.status).toBe(404);
    }

    const intocado = await json("GET", `/api/bookmarks/${bookmark.id}`, dona.cookie);
    expect(((await intocado.json()) as Bookmark).title).toBe("Docs do Hono");
  });
});

describe("PATCH /api/bookmarks/:id", () => {
  it("atualiza título preservando as tags", async () => {
    const aluna = await signUp();
    const bookmark = await criarBookmark(aluna, { tags: ["hono"] });

    const res = await patch(bookmark.id, aluna.cookie, { title: "Novo título" });

    expect(res.status).toBe(200);
    const body = (await res.json()) as Bookmark;
    expect(body.title).toBe("Novo título");
    expect(body.tags).toEqual(["hono"]);
  });

  it("rejeita PATCH com corpo vazio", async () => {
    const aluna = await signUp();
    const bookmark = await criarBookmark(aluna);

    const res = await patch(bookmark.id, aluna.cookie, {});

    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/bookmarks/:id", () => {
  it("apaga o próprio bookmark; GET seguinte é 404", async () => {
    const aluna = await signUp();
    const bookmark = await criarBookmark(aluna);

    const del = await json("DELETE", `/api/bookmarks/${bookmark.id}`, aluna.cookie);
    expect(del.status).toBe(204);

    const get = await json("GET", `/api/bookmarks/${bookmark.id}`, aluna.cookie);
    expect(get.status).toBe(404);
  });
});
