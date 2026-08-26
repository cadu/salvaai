# 03: Bookmarks API — CRUD sem auth (cap-02-api)

**What to build:** API Hono com rotas `/api/bookmarks` completas (listar, buscar por id, criar, atualizar, deletar) testáveis via curl/REST client, com validação Zod e formato de erro único.

**Blocked by:** 02 (database foundation)

**Status:** ready-for-human

- [x] Rotas CRUD completas em `/api/bookmarks`
- [x] Validação de entrada com Zod em todas as rotas de escrita
- [x] Formato de erro único e status codes corretos (400/404/201/etc.)
- [x] Testes cobrindo o caminho feliz e os erros de validação
- [x] Decisões documentadas: por que validar na API mesmo validando no form, formato de erro
- [x] Doc do capítulo: `docs/capitulos/cap-02-api.md`
