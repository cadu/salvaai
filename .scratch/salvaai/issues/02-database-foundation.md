# 02: Database foundation (cap-01-banco)

**What to build:** Postgres rodando via Docker Compose, Drizzle ORM configurado, schema das tabelas `users`, `sessions` e `bookmarks` criado e a primeira migration aplicada — dados visíveis no Drizzle Studio.

**Blocked by:** 01 (monorepo scaffold)

**Status:** ready-for-human

- [x] Docker Compose sobe o Postgres (`bun db:start`)
- [x] Drizzle configurado no workspace da API
- [x] Schema: `users`, `sessions`, `bookmarks` (título, url, descrição, tags, dono)
- [x] Primeira migration aplicada (`bun db:migrate`) e reversível
- [x] `bun db:studio` abre e mostra as tabelas
- [x] Decisões documentadas: modelagem do bookmark (campos, tags como texto vs tabela), índices
- [x] Doc do capítulo: `docs/capitulos/cap-01-banco.md`
