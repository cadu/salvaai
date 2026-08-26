# SalvaAí — Plano do Projeto

> Um app de bookmarks simples, construído passo a passo para **ensinar pessoas a fazer vibe coding**: criar apps de verdade conversando com IA, entendendo cada decisão ao longo do caminho.

---

## 1. Visão geral

**O que é:** um app onde o usuário cria uma conta, faz login e salva links (bookmarks) com título, URL, descrição e tags. CRUD completo: criar, listar, editar e excluir bookmarks.

**Para quem é este repositório:** pessoas aprendendo a desenvolver apps com auxílio de IA. Cada capítulo é uma etapa real de desenvolvimento, com as decisões explicadas em português.

**Princípios didáticos:**

- Cada capítulo entrega algo **visível e testável** no navegador.
- Toda decisão técnica vem acompanhada de um "porquê" (por que Hono e não Express? por que Drizzle?).
- Os prompts usados com a IA são documentados — o aluno vê _como_ pedir, não só o resultado.

---

## 2. Stack e justificativas

| Camada          | Escolha                                 | Por quê                                                                                     |
| --------------- | --------------------------------------- | ------------------------------------------------------------------------------------------- |
| Frontend        | React 19 + Vite + TypeScript            | Padrão de mercado, dev server instantâneo, TS pega erros cedo.                              |
| Roteamento      | TanStack Router                         | Type-safe, file-based routing, integra bem com TanStack Query.                              |
| Dados no client | TanStack Query                          | Cache, refetch e estados de loading resolvidos sem boilerplate.                             |
| UI              | shadcn/ui + Tailwind CSS                | Componentes copiáveis e customizáveis — ótimo pra aprender, pois o código vive no projeto.  |
| Backend         | Hono                                    | Leve, type-safe, roda em Node/Bun, API parecida com Express mas moderna.                    |
| ORM             | Drizzle ORM                             | Schema em TypeScript, migrations claras, SQL-like — transparente para quem está aprendendo. |
| Validação       | Zod                                     | Um schema valida na API e gera tipos no frontend.                                           |
| Banco           | PostgreSQL via Docker                   | Padrão da indústria; Docker isola o ambiente.                                               |
| Auth            | better-auth                             | Sessions robustas prontas, evita reinventar criptografia/sessions.                          |
| Monorepo        | Bun workspaces (`apps/web`, `apps/api`) | Um só `bun install`, scripts unificados.                                                    |

---

## 3. Estratégia de branches (a DX escolhida)

**Sim, um branch por capítulo** — é a melhor DX para tutorial:

```
main                ← código final completo + docs
└── cap-00-setup            ← monorepo vazio, tooling
    └── cap-01-banco        ← Docker + Drizzle + schema
        └── cap-02-api      ← Hono + CRUD de bookmarks
            └── cap-03-auth ← login/cadastro
                └── cap-04-ui ← React + shadcn/ui
                    └── cap-05-integracao ← tudo conectado
                        └── cap-06-polimento ← deploy/extras
```

Como funciona:

- **`main`** tem sempre o app funcionando por completo + os docs (`docs/capitulos/*.md`).
- Cada capítulo é um **branch encadeado** (`cap-03` nasce de `cap-02`). O aluno pode dar checkout em qualquer capítulo e seguir dali.
- Ao final de cada capítulo, o instrutor faz **merge incremental** para a main e cria uma **tag** (`v0.1`, `v0.2`...) como snapshot.
- O README explica: "para começar do zero, fique na `cap-00`; para ver o resultado final, fique na `main`".

Vantagens:

- Diff entre capítulos = material de estudo pronto (`git diff cap-02 cap-03`).
- Aluno nunca quebra o progresso anterior.
- Docs dos capítulos versionados junto do código correspondente.

---

## 4. Capítulos

### Capítulo 0 — Setup do ambiente

Monorepo com Bun workspaces, TypeScript configurado, ESLint/Prettier, Docker pro Postgres, script `dev` único rodando tudo.

> Decisões explicadas: por que monorepo? por que Bun? por que TypeScript desde o dia 1?

### Capítulo 1 — O banco de dados

Docker Compose com Postgres, Drizzle configurado, schema das tabelas `users`, `sessions`, `bookmarks`. Primeira migration.

> Decisões: modelagem do bookmark (campos, tags como texto vs tabela), índices.

### Capítulo 2 — A API (CRUD sem auth)

Hono com rotas `/api/bookmarks`: listar, buscar por id, criar, atualizar, deletar. Validação com Zod, tratamento de erros padronizado.

> Decisões: formato de erro único, status codes corretos, por que validar na API mesmo validando no form.

### Capítulo 3 — Autenticação

better-auth: cadastro, login, logout, sessions em cookie httpOnly. Rotas da API passam a exigir login; bookmarks são filtrados por usuário.

> Decisões: por que NUNCA salvar senha na mão, cookies httpOnly vs localStorage, autorização por dono do recurso.

### Capítulo 4 — O frontend

React + Vite + Tailwind + shadcn/ui instalado e tematizado. Telas: login/cadastro, lista de bookmarks (cards com grid), formulário de criar/editar (dialog), confirmação de delete.

> Decisões: componentes shadcn copiados pra dentro do projeto, composição de componentes, estados vazios e de loading.

### Capítulo 5 — Integração

TanStack Router com rotas protegidas (guarda de auth), TanStack Query consumindo a API, mutations otimistas.

> Decisões: invalidação de cache após mutation, o que colocar em query keys, redirect pós-login.

### Capítulo 6 — Polimento e próximos passos

Toasts, dark mode, favicon/OG image automático do link salvo (fetch das meta tags), busca/filtro por tag, build de produção e deploy.

> Decisões: o que é essencial vs "nice to have", como pedir pra IA refatorar com segurança.

---

## 5. Formato de cada capítulo (docs)

Cada capítulo terá um doc em `docs/capitulos/cap-XX-nome.md` com:

1. **Objetivo** — o que vai funcionar no fim do capítulo (com screenshot).
2. **Decisões** — tabela decisão → alternativas → por quê.
3. **Passo a passo** — incluindo os **prompts usados com a IA** em blocos de citação.
4. **O que aprender** — resumo dos conceitos novos.
5. **Checklist** — critérios de "pronto".

---

## 6. Comandos do projeto (alvo)

```bash
bun install          # instala tudo (monorepo)
bun dev              # sobe api + web juntos
bun db:start         # docker compose up -d (postgres)
bun db:migrate       # roda migrations
bun db:studio        # drizzle studio (ver dados)
```

---

## 7. Próximos passos imediatos

1. Criar branch `cap-00-setup`.
2. Inicializar monorepo (workspaces, tsconfig base, eslint).
3. Escrever `README.md` (pt-br) apresentando o curso.
4. Seguir para o Capítulo 1.
