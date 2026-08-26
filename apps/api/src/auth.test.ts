import { beforeAll, describe, expect, it } from "bun:test";
import { app } from "./app";
import { limparTabelas, signUp } from "./test-helpers";

beforeAll(limparTabelas);

describe("POST /api/auth/sign-up/email", () => {
  it("cria conta e volta com cookie de sessão httpOnly", async () => {
    const res = await app.request("/api/auth/sign-up/email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Nova Aluna",
        email: "nova@example.com",
        password: "senha-segura-123",
      }),
    });

    expect(res.status).toBe(200);
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("HttpOnly");
  });

  it("rejeita senha curta", async () => {
    const res = await app.request("/api/auth/sign-up/email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "X", email: "curta@example.com", password: "123" }),
    });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/sign-in/email", () => {
  it("loga com credenciais corretas e devolve cookie", async () => {
    const { email } = await signUp();
    const signOut = await app.request("/api/auth/sign-out", { method: "POST" });
    await signOut.text();

    const res = await app.request("/api/auth/sign-in/email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password: "senha-segura-123" }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toContain("HttpOnly");
  });

  it("rejeita senha errada com 401", async () => {
    const { email } = await signUp();

    const res = await app.request("/api/auth/sign-in/email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password: "senha-errada-456" }),
    });

    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/sign-out", () => {
  it("invalida a sessão", async () => {
    const { cookie } = await signUp();

    await app.request("/api/auth/sign-out", {
      method: "POST",
      headers: { cookie },
    });

    const depois = await app.request("/api/bookmarks", { headers: { cookie } });
    expect(depois.status).toBe(401);
  });
});
