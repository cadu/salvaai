# 04: Authentication (cap-03-auth)

**What to build:** Cadastro, login e logout via better-auth com sessions em cookie httpOnly. As rotas da API passam a exigir login e cada usuário só vê (e manipula) os próprios bookmarks.

**Blocked by:** 03 (bookmarks API)

**Status:** ready-for-human

- [x] better-auth configurado: signup, login, logout, session
- [x] Sessions persistidas na tabela `sessions`, cookie httpOnly
- [x] Senhas nunca salvas na mão (hash gerido pelo better-auth)
- [x] Rotas de bookmarks protegidas: 401 sem login
- [x] Bookmarks filtrados pelo dono; tentativa de acessar bookmark de outro usuário → 404/403
- [x] Testes: fluxo auth + isolamento entre usuários
- [x] Decisões documentadas: cookies httpOnly vs localStorage, autorização por dono do recurso
- [x] Doc do capítulo: `docs/capitulos/cap-03-auth.md`
