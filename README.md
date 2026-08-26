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

### Por que essas escolhas?

- **Por que monorepo?** Frontend e backend falam do mesmo domínio (bookmarks). Um repositório só significa um `bun install`, scripts unificados e — mais adiante — tipos compartilhados entre API e web.
- **Por que Bun?** Um único binário faz de gerenciador de pacotes, executor de testes e runtime do servidor. Menos ferramentas pra instalar e explicar, e velocidade que torna o ciclo editar → rodar → testar quase instantâneo.
- **Por que TypeScript desde o dia 1?** Migrar de JS pra TS depois é um projeto inteiro; começar com TS é só uma configuração. O modo estrito pega erros antes deles chegarem no navegador.
- **Por que Hono e não Express?** API parecida com a do Express (fácil de aprender), mas type-safe de ponta a ponta, com validação integrada via Zod e rodando nativamente no Bun.
- **Por que Drizzle?** Schema escrito em TypeScript, migrations legíveis e queries que parecem SQL — transparente pra quem está aprendendo banco de dados.

Os detalhes completos estão no [PLANO.md](./PLANO.md) e nos docs de cada capítulo.

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
