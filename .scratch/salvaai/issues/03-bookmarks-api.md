# 03: Bookmarks API — CRUD sem auth (cap-02-api)

**What to build:** API Hono com rotas `/api/bookmarks` completas (listar, buscar por id, criar, atualizar, deletar) testáveis via curl/REST client, com validação Zod e formato de erro único.

**Blocked by:** 02 (database foundation)

**Status:** ready-for-agent

- [ ] Rotas CRUD completas em `/api/bookmarks`
- [ ] Validação de entrada com Zod em todas as rotas de escrita
- [ ] Formato de erro único e status codes corretos (400/404/201/etc.)
- [ ] Testes cobrindo o caminho feliz e os erros de validação
- [ ] Decisões documentadas: por que validar na API mesmo validando no form, formato de erro
- [ ] Doc do capítulo: `docs/capitulos/cap-02-api.md`
