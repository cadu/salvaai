# 01: Monorepo scaffold (cap-00-setup)

**What to build:** A empty-but-running Bun monorepo: `bun install` installs everything and `bun dev` boots the API (`apps/api`, Hono hello-world) and the web app (`apps/web`, Vite + React + TS) together, so the instructor can open both in the browser from one command.

**Blocked by:** None (can start immediately).

**Status:** ready-for-human

- [x] Monorepo com Bun workspaces (`apps/web`, `apps/api`), um só `bun install`
- [x] TypeScript configurado desde o dia 1 (tsconfig base estrito compartilhado)
- [x] ESLint + Prettier rodando em ambos os apps
- [x] `bun dev` sobe api + web juntos (script unificado na raiz)
- [x] README.md (pt-br) apresentando o curso e explicando por que monorepo/Bun/TS
- [x] Doc do capítulo: `docs/capitulos/cap-00-setup.md` no formato do PLANO.md (objetivo, decisões, passo a passo com prompts, aprendizados, checklist)
