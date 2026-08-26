# SalvaAí

## Regras de trabalho

- **Banco de dados: só via migrations.** Nunca rode queries manuais no banco (psql, ALTER/DROP ad-hoc). Toda mudança de schema passa por `bun run --filter='@salvaai/api' db:generate` + `bun db:migrate`. Se o drizzle-kit travar (ex.: prompt interativo), peça para a pessoa rodar o comando à mão.
- **Nunca use `any`.** Type tudo direito: tipos do Hono (`Context`), inferência do Drizzle (`$inferSelect`/`$inferInsert`) e Zod (`z.infer`). Se um tipo real é desconhecido, use `unknown` e estreite com type guard. O ESLint bloqueia `any` (`@typescript-eslint/no-explicit-any`).

## Agent skills

### Issue tracker

Issues are tracked locally as markdown files under `.scratch/` in this repo. See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout — root `CONTEXT.md` + `docs/adr/`. See `docs/agents/domain.md`.
