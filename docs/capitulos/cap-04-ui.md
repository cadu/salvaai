# Capítulo 4 — O frontend

> **Objetivo:** ao fim deste capítulo, o app tem cara nova: tela de login/cadastro **funcionando de verdade contra a API** (better-auth), lista de bookmarks em grid de cards, formulário de criar/editar em dialog e confirmação antes de excluir. Auth é real; os dados dos bookmarks ainda são mockados (integração completa no Capítulo 5).

**Evidência (a tela de login, com o tema verde do SalvaAí):**

![Tela de login do SalvaAí](img/cap-04-login.png)

## Decisões

| Decisão                                     | Alternativas                              | Por quê                                                                                                                                                                                                            |
| ------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| shadcn/ui copiado para dentro do projeto    | Biblioteca de componentes (MUI, Ant)      | O código dos componentes vive em `src/components/ui` — dá pra ler, entender e mudar. Para quem está aprendendo, "abrir a caixa" vale mais do que importar caixa-preta.                                             |
| Auth integrada agora, bookmarks mockados    | Tudo mock ou tudo real de uma vez         | Auth é um fluxo autocontido (cadastro → login → sessão); testar ele isoladamente garante que funciona antes de conectar o CRUD.                                                                                    |
| better-auth client via `createAuthClient`   | Fetch manual com headers/cookies          | O client do better-auth já entende session, cookie e refetch — não inventamos roda. `signIn.email()` e `signUp.email()` são uma linha cada.                                                                        |
| Proxy Vite (`/api` → `localhost:3001`)      | CORS manual no Hono                       | Mesmo domínio = cookies same-origin, sem configuração de `Access-Control-Allow-Credentials`. O proxy já existia no scaffold do cap-00.                                                                             |
| `useSession()` como hook                    | Buscar sessão com `useEffect` + state     | O client do better-auth gerencia cache e refetch do estado de sessão; `useSession()` retorna `{ data, isPending }` sem boilerplate.                                                                                |
| Latência simulada (`esperar(500)`)          | Render instantâneo do mock                | Sem espera, os estados de loading nunca apareceriam — e estado de loading que não se vê é estado que não se testa.                                                                                                 |
| `BookmarkInput` separado de `Bookmark`      | Um tipo só com campos opcionais           | O que o formulário envia (`title`, `url`, `description`, `tags`) é diferente do que a lista guarda (`id`, `createdAt` vêm de fora). Tipos separados documentam essa fronteira — e espelham o que a API vai exigir. |
| Validação espelhando as regras da API       | Validar só no backend (ou só no frontend) | A API do Capítulo 2 já valida; o form valida de novo para dar feedback imediato. Nenhuma das duas confia na outra — frontend valida por UX, API valida por segurança.                                              |
| Dialog controlado (`open` + `onOpenChange`) | Dialog com trigger interno                | O mesmo dialog serve para criar e editar; quem decide o que ele mostra é a página, não o componente. Um estado (`emEdicao: Bookmark \| null`) comuta os dois modos.                                                |
| Confirmação de delete com AlertDialog       | `window.confirm`                          | O AlertDialog é acessível (foco preso, ESC, aria) e visualmente parte do app. `confirm()` quebra o estilo e não é customizável.                                                                                    |

## Passo a passo

### 1. Instalar o shadcn/ui e os componentes

```bash
bunx --bun shadcn@latest init        # uma vez: cria components.json + tema
bunx --bun shadcn@latest add button card input label field \
  dialog alert-dialog textarea badge skeleton --yes
```

O `--yes` aceita os defaults sem prompt. Os arquivos caem em `src/components/ui/` — **são seus**, pode editar.

> **Prompt usado com a IA:** _"Instale o shadcn/ui num app Vite + React + Tailwind v4 e adicione os componentes button, card, input, label, field, dialog, alert-dialog, textarea, badge e skeleton."_

### 2. Tematizar

A identidade do app mora em variáveis CSS (`--primary`, `--ring`, ...) no `src/index.css`. Trocar a cor de marca é mudar **um** token:

```css
:root {
  --primary: oklch(0.596 0.145 163.225); /* verde — botões, links, foco */
}
.dark {
  --primary: oklch(0.696 0.17 162.48); /* um tom mais claro no escuro */
}
```

Todos os componentes consomem `bg-primary`, `text-primary` etc. — a mudança se propaga sozinha.

### 3. Tipos e mock

```ts
// src/types.ts — espelha o schema da API (cap-01)
export type Bookmark = {
  id: string;
  title: string;
  url: string;
  description: string | null;
  tags: string[];
  createdAt: string;
};
export type BookmarkInput = Omit<Bookmark, "id" | "createdAt">;
```

O mock (`src/data/mock-bookmarks.ts`) guarda a lista inicial e um `esperar(ms)` que devolve uma Promise — é ele quem faz o loading existir para os bookmarks. O auth, porém, já é real.

### 4. O client do better-auth

```ts
// src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient();
```

O `createAuthClient()` configura automaticamente: `basePath` = `/api/auth` (mesmo domínio via proxy Vite), `fetch` do browser, cookies httpOnly. Um arquivo de 3 linhas — o Vite proxy cuida do resto.

> **Prompt usado com a IA:** _"Crie um auth-client.ts usando createAuthClient do better-auth/react, sem configuração manual de URL."_

### 5. As telas

- **`auth-screen.tsx`** — login e cadastro no mesmo card, alternados por um estado `modo`. Validação inline com `Field`/`FieldError`: email válido, senha ≥ 8, nome obrigatório só no cadastro. No submit, chama `authClient.signIn.email()` ou `authClient.signUp.email()` — se a API retornar erro (email duplicado, credenciais inválidas), exibe a mensagem abaixo do form. Sucesso → `window.location.reload()` para o `useSession()` do App pegar a nova sessão.
- **`App.tsx`** — usa `authClient.useSession()` como hook: `isPending` → carregando, `session?.user` → `BookmarksPage`, `null` → `AuthScreen`. Logout chama `authClient.signOut()` + reload.
- **`bookmarks-page.tsx`** — dona do estado: carrega o mock, guarda a lista e orquestra os dialogs. Grid responsivo (`sm:grid-cols-2 lg:grid-cols-3`) de `BookmarkCard`, com **skeletons** durante o load e **empty state** com call-to-action quando a lista está vazia.
- **`bookmark-form-dialog.tsx`** — um dialog, dois modos: `bookmark === null` cria, senão edita (campos pré-preenchidos via `useEffect`). Tags entram como texto livre separado por vírgula e saem como `string[]` normalizado (trim, lowercase, sem vazios).
- **`bookmark-card.tsx`** — card burro (só exibe + dispara callbacks): hostname extraído da URL, título linkado (`target="_blank"`), descrição, badges de tags e ações de editar/excluir.
- **`confirm-delete-dialog.tsx`** — AlertDialog que recebe o bookmark a excluir ou `null` (fechado).

A composição fica na página: cards e dialogs não sabem da existência uns dos outros.

### 6. Rodar e conferir

```bash
bun db:start && bun db:migrate   # banco up
bun dev                           # api + web juntos
```

Fluxo de teste: abra `localhost:5173` → crie uma conta (cadastro) → veja a lista de bookmarks → faça logout → entre com as credenciais → tente entrar com senha errada e veja a mensagem de erro → tente cadastrar email duplicado. O auth é real; os bookmarks ainda são mockados (integração completa no Capítulo 5).

## O que aprender

- **Componentes copiáveis vs bibliotecas**: com shadcn, o código é do app — leia o `button.tsx`, veja como `cva` + `cn` montam as variantes.
- **Design tokens**: uma cor de marca é uma variável CSS, não um valor hex repetido em 20 lugares.
- **Auth client vs fetch manual**: `createAuthClient()` do better-auth gerencia cookie, session e refetch. Uma chamada `signIn.email()` substitui 20 linhas de fetch + headers + tratamento.
- **Mesmo domínio com proxy**: o Vite proxy redireciona `/api` para `localhost:3001` — cookies ficam same-origin, sem configuração de CORS.
- **Estados que o Figma esquece**: loading (skeleton), vazio (call-to-action), erro de validação (inline no campo). Toda lista tem pelo menos os dois primeiros.
- **Componente burro vs página inteligente**: cards e dialogs recebem props e disparam callbacks; só a página conhece a lista inteira.
- **Um dialog, dois modos**: criar e editar são o mesmo form com dados diferentes — `null` é o flag.

## Checklist

- [x] shadcn/ui instalado e tematizado (verde SalvaAí, tokens em `index.css`)
- [x] Tela de cadastro funcionando contra a API (better-auth)
- [x] Tela de login funcionando, erro exibido quando credenciais inválidas
- [x] Logout acessível na UI (signOut + reload)
- [x] Lista de bookmarks em grid responsivo de cards (mockados)
- [x] Estados de loading (skeletons) e vazio (call-to-action)
- [x] Criar e editar no mesmo dialog, com validação espelhando a API
- [x] Exclusão sempre com confirmação (AlertDialog)
- [x] Decisões documentadas: composição de componentes shadcn, auth client, estados vazios/loading
