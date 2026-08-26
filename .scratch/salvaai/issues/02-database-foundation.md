# 02: Database foundation (cap-01-banco)

**What to build:** Postgres rodando via Docker Compose, Drizzle ORM configurado, schema das tabelas `users`, `sessions` e `bookmarks` criado e a primeira migration aplicada — dados visíveis no Drizzle Studio.

**Blocked by:** 01 (monorepo scaffold)

**Status:** ready-for-agent

- [ ] Docker Compose sobe o Postgres (`bun db:start`)
- [ ] Drizzle configurado no workspace da API
- [ ] Schema: `users`, `sessions`, `bookmarks` (título, url, descrição, tags, dono)
- [ ] Primeira migration aplicada (`bun db:migrate`) e reversível
- [ ] `bun db:studio` abre e mostra as tabelas
- [ ] Decisões documentadas: modelagem do bookmark (campos, tags como texto vs tabela), índices
- [ ] Doc do capítulo: `docs/capitulos/cap-01-banco.md`
