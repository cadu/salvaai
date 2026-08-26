# Capítulo 2 — A API (CRUD sem auth)

> **Objetivo:** ao fim deste capítulo, a API responde CRUD completo em `/api/bookmarks` — criar, listar, buscar por id, atualizar e deletar — com validação Zod, formato de erro único e status codes corretos, tudo provado por testes contra o banco de verdade.

**Evidência (a API viva, via `curl`)** — capítulo de API, então o "screenshot" é o transcript do terminal:

```
$ curl -X POST localhost:3001/api/bookmarks -H "content-type: application/json" \
    -d '{"userId":"não-uuid","title":"","url":"x"}'
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "payload inválido",
    "details": [
      { "path": "userId", "message": "Invalid UUID" },
      { "path": "title",  "message": "Too small: expected string to have >=1 characters" },
      { "path": "url",    "message": "Invalid URL" }
    ]
  }
}
```

## Decisões

| Decisão                                                       | Alternativas                          | Por quê                                                                                                                                                                                                                                                        |
| ------------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Formato de erro único `{ error: { code, message, details } }` | Mensagens soltas variadas a cada rota | O frontend vai tratar erro **uma vez só**, não uma vez por endpoint. O `code` é estável pra lógica; o `message` é humano; `details` (por campo) vem preenchido na validação e vazio nas outras. Um único helper (`apiError`) monta todas as respostas de erro. |
| Validar na API mesmo validando no form                        | Confiar no frontend                   | O form pode ser burlado (curl, Postman, requisição manual). A API é a fronteira de confiança — o que entra no banco passou por validação, sempre.                                                                                                              |
| Zod para descrever o payload                                  | Validação manual com ifs              | O schema Zod é a documentação executável do contrato da API. E no Capítulo 5 ele gera os tipos que o frontend consome — um schema, dois usos.                                                                                                                  |
| Rotas aninhadas num `Hono()` separado (`bookmarkRoutes`)      | Tudo no `app.ts`                      | Cada módulo cuida das suas rotas; o `app.ts` só compõe. Quando o auth chegar, quem monta continua sendo o app.                                                                                                                                                 |
| `PATCH` parcial com `.partial()` + "ao menos um campo"        | `PUT` exigindo o objeto inteiro       | PATCH expressa intenção de mudança pontual; o `.refine()` garante que não chegamos ao banco com um update vazio.                                                                                                                                               |
| `userId` no payload (temporário!)                             | Esperar o capítulo de auth            | É o scaffolding honesto: sem sessão ainda, o dono vem no corpo. O Capítulo 3 remove isso — e os testes mostram exatamente onde.                                                                                                                                |

## Passo a passo

### 1. Os testes primeiro

Catorze testes descrevem o comportamento completo antes de qualquer rota existir:

```ts
it("rejeita payload sem título com 400 e formato de erro único", async () => {
  const res = await app.request("/api/bookmarks", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ userId: user.id, url: "https://react.dev" }),
  });

  expect(res.status).toBe(400);
  const body = await res.json();
  expect(body.error.code).toBe("VALIDATION_ERROR");
});
```

Repare que o teste usa `app.request(...)` — nem servidor nem porta: a aplicação Hono processa a requisição na memória. É o mesmo truque do `/api/health` do Capítulo 0, agora renderizando um CRUD inteiro.

Os testes também limparam as tabelas antes e depois (`beforeAll`/`afterAll`) — aprendemos da pior forma que dados de uma execução antiga vazam pro teste seguinte.

> **Prompt usado com a IA:** _"Escreva testes bun:test para CRUD completo de /api/bookmarks usando app.request: criação feliz, payload inválido, JSON malformado, 404 de id inexistente, id não-uuid, atualização parcial e delete. Erros seguem { error: { code, message } }."_

### 2. O contrato em Zod

```ts
export const bookmarkCreateSchema = z.object({
  userId: z.uuid(),
  title: z.string().min(1),
  url: z.url(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export const bookmarkUpdateSchema = bookmarkCreateSchema
  .omit({ userId: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "envie ao menos um campo para atualizar",
  });
```

O schema de update é escrito à mão (todos os campos `.optional()`), **não derivado** com `.partial()` — porque o campo `tags` do schema de criação tem `.default([])`, e derivar faria um PATCH de só-título virar "apague as tags". Regras de criação e atualização parecem irmãs, mas são contratos diferentes. O `.refine()` garante que não chegamos ao banco com um update vazio — e tem teste provando.

### 3. As rotas

Cada rota segue o mesmo esqueleto: valida → consulta → responde. Os status codes contam a história: `201` criou, `204` apagou, `400` payload ruim, `404` não existe — e criar bookmark pra um usuário que não existe também é `404` (`USER_NOT_FOUND`), não um crash 500.

```ts
export const bookmarkRoutes = new Hono().post("/", async (c) => {
  const parsed = bookmarkCreateSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return validationError(c, parsed.error.issues);

  const [criado] = await db.insert(bookmarks).values(parsed.data).returning();
  return c.json(criado, 201);
});
// ... get, get/:id, patch/:id, delete/:id
```

O `.catch(() => null)` transforma JSON malformado em falha de validação — mesmo erro, mesmo formato, um caminho só.

> **Prompt usado com a IA:** _"Implemente as rotas CRUD em apps/api/src/bookmarks/routes.ts usando os schemas Zod. Erro de validação vira 400 com details por campo; id inexistente vira 404 com code NOT_FOUND; delete devolve 204. Monte o router no app.ts em /api/bookmarks."_

## O que aprender

- **A API como fronteira de confiança**: validação vive onde o dado entra no sistema.
- **Contrato de erro**: clientes tratam erros por `code`, não por texto.
- **Derivação de schemas**: `.omit().partial()` mantém regras em um lugar só.
- **Testar sem servidor**: `app.request()` testa HTTP na memória, rápido e determinístico.
- **Isolamento de teste**: limpar estado antes _e_ depois evita vazamento entre execuções.

## Checklist

- [x] Rotas CRUD completas em `/api/bookmarks`
- [x] Validação de entrada com Zod em todas as rotas de escrita
- [x] Formato de erro único e status codes corretos (400/404/201/204)
- [x] Testes cobrindo o caminho feliz e os erros de validação (14 testes de rota)
- [x] Decisões documentadas: validar na API vs form, formato de erro único
