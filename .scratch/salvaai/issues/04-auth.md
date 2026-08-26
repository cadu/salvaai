# 04: Authentication (cap-03-auth)

**What to build:** Cadastro, login e logout via better-auth com sessions em cookie httpOnly. As rotas da API passam a exigir login e cada usuário só vê (e manipula) os próprios bookmarks.

**Blocked by:** 03 (bookmarks API)

**Status:** ready-for-agent

- [ ] better-auth configurado: signup, login, logout, session
- [ ] Sessions persistidas na tabela `sessions`, cookie httpOnly
- [ ] Senhas nunca salvas na mão (hash gerido pelo better-auth)
- [ ] Rotas de bookmarks protegidas: 401 sem login
- [ ] Bookmarks filtrados pelo dono; tentativa de acessar bookmark de outro usuário → 404/403
- [ ] Testes: fluxo auth + isolamento entre usuários
- [ ] Decisões documentadas: cookies httpOnly vs localStorage, autorização por dono do recurso
- [ ] Doc do capítulo: `docs/capitulos/cap-03-auth.md`
