# SalvaAí

Um app de bookmarks simples, construído passo a passo para **ensinar pessoas a fazer vibe coding**: criar apps de verdade conversando com IA, entendendo cada decisão ao longo do caminho.

## O que é

O usuário cria uma conta, faz login e salva links com título, URL, descrição e tags — CRUD completo de bookmarks. Mas o produto final é só metade da história: este repositório é um **curso**, onde cada capítulo é uma etapa real de desenvolvimento com as decisões explicadas em português.

## Como seguir o curso

Cada capítulo vive em um branch encadeado (`cap-01` nasce de `cap-00`). Escolha por onde começar:

- **Do zero:** `git checkout cap-00-setup` e siga os docs de `docs/capitulos/` na ordem.
- **Só ver o resultado:** fique na `main` — sempre tem o app completo funcionando.
- **De um ponto específico:** dê checkout no capítulo anterior ao que te interessa e siga dali.

O diff entre dois capítulos é material de estudo pronto: `git diff cap-02-api cap-03-auth` mostra exatamente o que mudou.

## Stack

| Camada          | Escolha                      |
| --------------- | ---------------------------- |
| Frontend        | React 19 + Vite + TypeScript |
| Roteamento      | TanStack Router              |
| Dados no client | TanStack Query               |
| UI              | shadcn/ui + Tailwind CSS     |
| Backend         | Hono                         |
| ORM             | Drizzle ORM                  |
| Validação       | Zod                          |
| Banco           | PostgreSQL via Docker        |
| Auth            | better-auth                  |
| Monorepo        | Bun workspaces               |

As justificativas de cada escolha estão no [PLANO.md](./PLANO.md) e explicadas em detalhe nos docs de cada capítulo.

## Comandos

```bash
bun install          # instala tudo (monorepo)
bun dev              # sobe api + web juntos
bun test             # roda os testes
bun typecheck        # TypeScript nos dois apps
bun lint             # ESLint
bun format           # Prettier
```

## Estrutura

```
apps/
├── api/   ← backend Hono
└── web/   ← frontend React + Vite
docs/
└── capitulos/  ← material do curso, um doc por capítulo
```
