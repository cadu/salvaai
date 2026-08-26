import { app } from "./app";
import { db } from "./db";
import { account, session, user } from "./db/auth-schema";
import { bookmarks } from "./db/schema";

let seq = 0;

export async function limparTabelas() {
  await db.delete(bookmarks);
  await db.delete(session);
  await db.delete(account);
  await db.delete(user);
}

export type UsuarioLogado = {
  cookie: string;
  id: string;
  email: string;
};

export async function signUp(overrides: { email?: string; name?: string; password?: string } = {}) {
  const dados = {
    name: overrides.name ?? "Aluna de teste",
    email: overrides.email ?? `aluna-${seq++}@example.com`,
    password: overrides.password ?? "senha-segura-123",
  };

  const res = await app.request("/api/auth/sign-up/email", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(dados),
  });

  if (!res.ok) throw new Error(`sign-up falhou com ${res.status}: ${await res.text()}`);

  const cookies =
    typeof res.headers.getSetCookie === "function"
      ? res.headers.getSetCookie()
      : [res.headers.get("set-cookie") ?? ""];
  const cookie = cookies.map((c) => c.split(";")[0]).join("; ");
  if (!cookie) throw new Error("sign-up não devolveu cookie de sessão");

  const body = (await res.json()) as { user?: { id: string } };
  if (!body.user?.id) throw new Error("sign-up não devolveu o usuário");

  return { cookie, id: body.user.id, email: dados.email } satisfies UsuarioLogado;
}
