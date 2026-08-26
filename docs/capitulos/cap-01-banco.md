# Capítulo 1 — O banco de dados

> **Objetivo:** ao fim deste capítulo, o Postgres sobe com um comando (`bun db:start`), o schema de `users`, `sessions` e `bookmarks` existe no banco via migration Drizzle, e testes provam que tudo funciona — inclusive regras como email único e cascade delete.

**Evidência (o banco, visto pelo `psql`):**

```
$ docker compose exec db psql -U salvaai -d salvaai -c "\dt"
          List of relations
 Schema |   Name    | Type  |  Owner
--------+-----------+-------+---------
 public | bookmarks | table | salvaai
 public | sessions  | table | salvaai
 public | users     | table | salvaai
(3 rows)
```

Para explorar visualmente: `bun db:studio` abre o **Drizzle Studio** em `https://local.drizzle.studio`. (Na primeira vez, seu navegador pode pedir permissão de "acesso à rede local" para conversar com o servidor local na porta 4983.)

## Decisões

| Decisão | Alternativas | Por quê |
|---------|--------------|---------|
| Postgres via Docker | Instalar Postgres direto na máquina | Docker isola o ambiente: mesma versão pra todo mundo que seguir o curso, e `docker compose down -v` apaga tudo sem culpa. |
| Tags como `text[]` (array) | Tabela de junção `bookmark_tags` | Para o escopo do SalvaAí (buscar/filtrar por tag), array nativo do Postgres resolve sem JOIN. Se um dia precisarmos de metadados por tag, aí sim a tabela nasce. Migração futura é fácil — migrations existem justamente pra isso. |
| `userId` com `ON DELETE CASCADE` | Deletar bookmarks na mão antes do usuário | O banco garante a regra "sem usuário órfão". Regras de integridade pertencem ao banco, não à boa vontade do código da API. |
| Email com índice único | Validar unicidade só na aplicação | Único jeito de garantir de verdade: duas requisições simultâneas passam por qualquer validação de aplicação, mas não por uma constraint. |
| UUID gerado pelo banco (`defaultRandom`) | Serial/integer auto-increment | UUIDs não expõem contagem de usuários/bookmarks em URLs e evitam colisão ao unir dados. |
| Índices em `bookmarks.user_id` e `created_at` | Sem índices além das PKs | A query mais comum do app será "bookmarks do usuário, mais recentes primeiro" — os índices nascem da query, não do achismo. |
| Migration versionada no repo (`drizzle/0000_*.sql`) | `drizzle-kit push` (sync direto) | O SQL da migration é histórico auditável: dá pra ler o que mudou entre capítulos. `push` é conveniente em protótipos e perigoso depois. |

## Passo a passo

### 1. O Postgres em uma porta só

O `compose.yaml` na raiz define o serviço `db` com volume nomeado (`salvaai-pgdata`) — os dados sobrevivem a `docker compose restart`:

```yaml
services:
  db:
    image: postgres:17-alpine
    ports: ["5432:5432"]
    volumes:
      - salvaai-pgdata:/var/lib/postgresql/data
```

> **Prompt usado com a IA:** *"Crie um compose.yaml com Postgres 17, usuário/senha/database salvaai, porta 5432 e volume nomeado para persistir dados."*

> **Armadilha real deste capítulo:** a imagem `postgres:18` mudou o layout de volumes e quebrou com nossa configuração. Usamos `postgres:17-alpine`, estável e bem documentado. Quando algo "simples" falha, leia o log do container — a resposta estava lá.

### 2. Configuração por ambiente

O `.env` guarda a `DATABASE_URL` (o `.env.example` documenta as variáveis sem vazar segredo — o `.gitignore` mantém o `.env` real fora do git).

### 3. Schema como código TypeScript (test-first)

De novo, o teste veio primeiro — e ele roda contra o Postgres de verdade:

```ts
// apps/api/src/db/schema.test.ts (resumo)
it("salva e busca um bookmark com dono e tags", async () => {
  const [user] = await db.insert(users).values({ ... }).returning();
  const [bookmark] = await db.insert(bookmarks).values({
    userId: user.id,
    title: "Docs do Hono",
    url: "https://hono.dev",
    tags: ["docs", "hono"],
  }).returning();

  expect(bookmark.tags).toEqual(["docs", "hono"]);
});
```

Quatro testes cobrem o que o banco promete: salvar e buscar com dono e tags, email único, cascade delete e sessão com expiração.

O schema em si (`src/db/schema.ts`) é TypeScript puro — o `drizzle-kit generate` transforma essas definições em SQL versionado:

```ts
export const bookmarks = pgTable("bookmarks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  tags: text("tags").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, ...);
```

### 4. Migration e reversibilidade

```bash
bun db:migrate   # aplica as migrations pendentes
```

A migration é SQL plano (`apps/api/drizzle/0000_*.sql`) — dá pra ler, versionar e reverter. Testamos a reversibilidade de verdade: derrubamos o schema (`DROP SCHEMA public CASCADE` + o schema de controle `drizzle`), rodamos `bun db:migrate` de novo e todos os testes passaram do zero.

> **Prompt usado com a IA:** *"Modele em Drizzle as tabelas users, sessions e bookmarks com email único, cascade delete nos filhos, tags como array de texto e índices para 'bookmarks mais recentes por usuário'. Depois gere a migration."*

## O que aprender

- **Docker Compose**: infraestrutura do projeto como código, versionada junto.
- **Schema-as-code**: o modelo de dados vive em TypeScript, versionado e revisável.
- **Migrations ≠ push**: mudança de schema é história que se acumula, não sincronização.
- **Constraints no banco**: unique, FK com cascade — integridade onde ela é garantida.
- **Índices nascem de queries**: indexe o que você vai consultar, não o que você imagina.

## Checklist

- [x] `bun db:start` sobe o Postgres via Docker Compose
- [x] Drizzle configurado no workspace da API
- [x] Schema: `users`, `sessions`, `bookmarks` (título, url, descrição, tags, dono)
- [x] Primeira migration aplicada (`bun db:migrate`) e reversível (testada do zero)
- [x] `bun db:studio` abre o Drizzle Studio apontando pro banco local
- [x] Decisões documentadas: modelagem do bookmark, tags como array vs tabela, índices
