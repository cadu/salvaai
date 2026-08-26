# Capítulo 3 — Autenticação

> **Objetivo:** ao fim deste capítulo, cadastro/login/logout funcionam via better-auth com sessão em cookie httpOnly; as rotas de bookmarks exigem login e cada usuário só enxerga (e manipula) os próprios bookmarks — provado por testes de isolamento.

**Evidência (a API viva, via `curl`):**

```
$ curl -X POST localhost:3001/api/bookmarks -H "content-type: application/json" \
    -d '{"title":"x","url":"https://example.com"}'
{"error":{"code":"UNAUTHORIZED","message":"faça login para acessar seus bookmarks","details":[]}}

$ curl -c cookies.txt -X POST localhost:3001/api/auth/sign-up/email ...   # cria conta
$ curl -b cookies.txt -X POST localhost:3001/api/bookmarks ...            # 201, dono = sessão
```

## Decisões

| Decisão                                              | Alternativas                               | Por quê                                                                                                                                                                                                                                                   |
| ---------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| better-auth cuidando de senha/sessão                 | Hash na mão com bcrypt + tabela própria    | "Nunca salve senha na mão" é regra de ouro: hash com salt correto, timing-safe compare, expiração e renovação de token — cada um desses detalhes é um buraco de segurança em potencial. better-auth resolve tudo isso testado pela comunidade.            |
| Sessão em cookie **httpOnly**                        | Token no localStorage                      | JavaScript não lê cookie httpOnly — então um XSS no frontend não consegue furtar a sessão. localStorage é o alvo clássico.                                                                                                                                |
| Tabelas de auth geradas pelo CLI do better-auth      | Modelar user/session à mão                 | O adapter espera colunas exatas (e o runtime cobra as que faltam — aprendemos na prática com o campo `issuer`). Schema do dono da funcionalidade vem do próprio dono.                                                                                     |
| Dono do bookmark vem da **sessão**, nunca do payload | Aceitar `userId` no corpo                  | O payload pode mentir; a sessão, não. O Capítulo 2 aceitava `userId` como scaffolding — este capítulo remove ele pra sempre.                                                                                                                              |
| Autorização por dono do recurso no WHERE             | Buscar primeiro, checar depois             | `WHERE id = ? AND user_id = ?` devolve vazio quando não é seu → mesmo 404 de "não existe". Não vaza existência de recurso alheio (sem 403 que delata).                                                                                                    |
| Migrations esmagadas em baseline nova                | Migration incremental com prompt de rename | O drizzle-kit queria perguntar se `users` virou `user` (tabela do better-auth) — prompt interativo que travou nosso fluxo. Em dev, sem dados a preservar, recomeçamos o histórico de migrations do zero. Custo zero aqui; em produção, seria incremental. |

## Passo a passo

### 1. Instalar e configurar

```ts
// apps/api/src/auth.ts
export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET ?? "segredo-inseguro-apenas-para-dev",
  database: drizzleAdapter(db, { provider: "pg", schema: authSchema }),
  emailAndPassword: { enabled: true },
});
```

> **Prompt usado com a IA:** _"Configure better-auth num app Hono rodando no Bun: adapter Drizzle Postgres, email+senha habilitado, cookie httpOnly, secret vindo do .env."_

O `secret` assina os cookies de sessão. No `.env.example` ele está documentado; troque por um valor longo e aleatório fora de dev (`openssl rand -base64 32`).

### 2. As tabelas de auth

O CLI do better-auth gera o schema Drizzle das tabelas dele (`user`, `session`, `account`, `verification`):

```bash
bunx @better-auth/cli generate --config src/auth.ts --output src/db/auth-schema.ts
```

Duas lições deste capítulo:

- O **CLI e o runtime precisam estar na mesma versão** — o arquivo gerado veio sem a coluna `issuer` que o runtime esperava, e adicionamos ela manualmente ao schema.
- Quando o drizzle-kit pede decisão interativa ("essa tabela foi renomeada?"), o caminho honesto em dev foi **esmagar tudo numa migration baseline nova**. Reproduzível: `docker compose down -v` → `bun db:migrate` → banco inteiro de volta.

### 3. Montar as rotas de auth e proteger as de bookmarks

```ts
// apps/api/src/app.ts
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));
```

E o middleware que transforma "logado" em dado:

```ts
.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return apiError(c, 401, "UNAUTHORIZED", "faça login para acessar seus bookmarks");
  }
  c.set("userId", session.user.id); // vem da sessão, não do payload
  await next();
})
```

Nas rotas, o dono entra no filtro: `where(and(eq(bookmarks.id, id), eq(bookmarks.userId, userId)))`.

### 4. Testes de isolamento

```ts
it("outra pessoa recebe 404 ao buscar, atualizar ou apagar bookmark alheio", async () => {
  const dona = await signUp();
  const intrusa = await signUp();
  const bookmark = await criarBookmark(dona);

  for (const [method, corpo] of [["GET", undefined], ["PATCH", {...}], ["DELETE", undefined]]) {
    const res = await request(`/api/bookmarks/${bookmark.id}`, method, intrusa.cookie, corpo);
    expect(res.status).toBe(404);
  }
});
```

O helper `signUp()` passa pelo endpoint real de cadastro — os testes exercem o mesmo caminho que o navegador vai usar, cookie incluído.

## O que aprender

- **Não invente criptografia**: delegue senha/sessão para biblioteca mantida.
- **httpOnly vs localStorage**: onde a sessão mora define o que um XSS consegue roubar.
- **Identidade ≠ payload**: quem você é vem da sessão; o corpo da requisição só descreve o que quer.
- **404 vs 403**: responder 404 para recurso alheio não confirma que ele existe.
- **Migrations são história**: às vezes a história precisa recomeçar (baseline), mas sempre via migration — nunca SQL solto.

## Checklist

- [x] better-auth configurado: signup, login, logout, session
- [x] Sessions persistidas na tabela `session`, cookie httpOnly
- [x] Senhas nunca salvas na mão (hash gerido pelo better-auth)
- [x] Rotas de bookmarks protegidas: 401 sem login
- [x] Bookmarks filtrados pelo dono; acesso de outro usuário → 404
- [x] Testes: fluxo auth completo + isolamento entre usuários
- [x] Decisões documentadas: cookies httpOnly vs localStorage, autorização por dono
