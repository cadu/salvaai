# SalvaAí

App de bookmarks construído capítulo a capítulo para ensinar vibe coding do zero.

## Quick start

```bash
git clone <repo-url> && cd ox-alpha
bun install
cp .env apps/api/.env   # copia variáveis de ambiente para a API
bun db:start            # sobe Postgres no Docker
bun db:migrate          # roda migrations
bun dev                 # API em :3001, web em :5173
```

Acesse `http://localhost:5173`. Crie uma conta e comece a salvar links.

## Navegando pelos capítulos

Cada capítulo é uma branch com tag de snapshot. Para começar do zero, use `cap-00`. Para ver o app completo, use `main`.

| Branch   | Tag    | O que tem                                              |
| -------- | ------ | ------------------------------------------------------ |
| `cap-00` | `v0.0` | Monorepo vazio: Bun workspaces, Vite, Tailwind, shadcn |
| `cap-01` | `v0.1` | Postgres + Docker, Drizzle ORM, migrations             |
| `cap-02` | `v0.2` | API REST: GET/POST/PATCH/DELETE bookmarks              |
| `cap-03` | `v0.3` | Auth com better-auth: signup, login, sessão            |
| `cap-04` | `v0.4` | Frontend: auth screens + CRUD de bookmarks             |
| `cap-05` | `v0.5` | TanStack Router + Query: rotas protegidas, cache       |
| `cap-06` | `v0.6` | Sonner toasts, dark mode, skeleton loading             |
| `cap-07` | `v0.7` | Favicon, busca por texto, filtro por tag               |
| `main`   | `v0.7` | App completo                                           |

```bash
# Começar do zero:
git checkout cap-00

# Ver o app completo:
git checkout main
```

## Arquitetura

```
ox-alpha/
├── apps/
│   ├── api/          Hono + Drizzle + better-auth
│   └── web/          React + Vite + TanStack Router/Query
├── docs/
│   └── capitulos/    Doc de cada capítulo
├── .scratch/         Issues e tracking
└── AGENTS.md         Regras para agentes de IA
```

## Tech stack

- **Runtime:** Bun
- **API:** Hono, Drizzle ORM, better-auth
- **Frontend:** React, Vite, Tailwind CSS, shadcn/ui
- **Routing:** TanStack Router (file-based)
- **Data fetching:** TanStack Query
- **Database:** Postgres (Docker)
- **Toasts:** Sonner

## Variáveis de ambiente

A API precisa de um arquivo `apps/api/.env` com:

```bash
BETTER_AUTH_URL=http://localhost:3001
BETTER_AUTH_SECRET=<qualquer-string-longo>
DATABASE_URL=postgresql://salvaai:salvaai@localhost:5432/salvaai
CORS_ORIGIN=http://localhost:5173
```

Copie o `.env` da raiz: `cp .env apps/api/.env`

## Comandos úteis

```bash
bun dev              # Roda API + web em modo dev
bun db:start         # Sobe Postgres no Docker
bun db:stop          # Para o Docker
bun db:migrate       # Roda migrations
bun db:studio        # Abre Drizzle Studio
bun db:reset         # Recria banco do zero
bun run typecheck    # Typecheck nos dois apps
bun run lint         # ESLint nos dois apps
```

## Licença

MIT
