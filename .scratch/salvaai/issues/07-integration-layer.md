# 07: Integration layer (cap-05-integracao)

**What to build:** Tudo conectado com qualidade: TanStack Router com rotas protegidas (guarda de auth), TanStack Query consumindo a API com cache, mutations otimistas e invalidação correta — a UI reage instantâneo e nunca mostra dado de outro usuário.

**Blocked by:** 06 (bookmark management UI)

**Status:** ready-for-agent

- [ ] TanStack Router com file-based routing e rotas protegidas por auth
- [ ] Redirect pós-login para onde o usuário ia
- [ ] TanStack Query consumindo todos os endpoints da API
- [ ] Invalidação de cache após cada mutation
- [ ] Mutation otimista em pelo menos um fluxo (ex.: delete)
- [ ] Decisões documentadas: o que vai nas query keys, quando invalidar
- [ ] Doc do capítulo: `docs/capitulos/cap-05-integracao.md`
