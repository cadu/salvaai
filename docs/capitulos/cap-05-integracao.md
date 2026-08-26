# Capítulo 5 — Integração

> **Objetivo:** ao fim deste capítulo, o app usa TanStack Router para navegação com rotas protegidas e TanStack Query para consumir a API com cache, invalidação e mutation otimista. O aluno vê na prática o que muda na UX quando o estado do servidor é gerenciado corretamente.

## Decisões

| Decisão                                     | Alternativas                                   | Por quê                                                                                                                                                                                         |
| ------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TanStack Router com file-based routing      | React Router manual ou roteamento no `App.tsx` | Rotas em arquivos (`src/routes/`) são fáceis de navegar; o plugin gera a árvore de rotas automaticamente. O student vê a relação entre arquivo e URL.                                           |
| Auth guard no layout `_authed.tsx`          | Guard em cada rota protegida                   | Um layout pathless aplica a verificação de sessão em todas as rotas filhas — não precisa lembrar de colocar o guard em cada uma.                                                                |
| `window.location.href` para logout e signUp | Navegação via `navigate()`                     | O `signOut()` do better-auth pode não atualizar o nanostore imediatamente; uma navegação forçada (`location.href`) garante recarregamento limpo da sessão. Simples e confiável para tutorial.   |
| TanStack Query para dados do servidor       | `useEffect` + `useState` com fetch manual      | Query gerencia cache, refetch e estados de loading. Mutation com invalidação garante que a lista sempre reflete o servidor. O student vê a diferença entre "fetch manual" e "query gerenciada". |
| Query key `["bookmarks"]`                   | Chaves compostas como `["bookmarks", userId]`  | Como a API filtra por usuário no server-side, uma chave simples basta — o cookie de sessão identifica o usuário. Chaves compostas seriam úteis se fizéssemos prefetch por userId.               |
| Mutation otimista no delete                 | Delete + refetch simples                       | O card some imediatamente (UX instantânea); se o delete falhar, o card volta. Mostra ao student o padrão `onMutate` → `onError` → `onSettled` do TanStack Query.                                |
| `staleTime: 30_000`                         | Dados sempre frescos (`staleTime: 0`)          | 30 segundos evita refetches desnecessários entre mutations. Em produção, o staleTime pode ser ajustado conforme a necessidade de frescor dos dados.                                             |

## Passo a passo

### 1. Instalar as dependências

```bash
cd apps/web
bun add @tanstack/react-router @tanstack/react-query @tanstack/router-plugin
```

> **Prompt usado com a IA:** _"Instale TanStack Router e TanStack Query num app Vite + React. Configure file-based routing com o plugin do Vite."_

### 2. Configurar o Vite plugin

```ts
// vite.config.ts
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [TanStackRouterVite({ quoteStyle: "double" }), react(), tailwindcss()],
  // ...
});
```

O plugin gera `src/routeTree.gen.ts` automaticamente — **não edite esse arquivo**.

### 3. A árvore de rotas

```
src/routes/
  __root.tsx              ← root: QueryClientProvider + Outlet
  index.tsx               ← / → redireciona baseado na sessão
  login.tsx               ← /login → formulário de login
  signup.tsx              ← /signup → formulário de cadastro
  _authed.tsx             ← layout: checa sessão, redireciona se não logado
  _authed.bookmarks.tsx   ← /bookmarks → lista de bookmarks
```

O prefixo `_` indica um layout **pathless** — ele envolve os filhos sem adicionar segmento na URL. `_authed.tsx` verifica a sessão e redireciona para `/login` se não houver cookie.

### 4. O root layout

```tsx
// src/routes/__root.tsx
function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
```

O `QueryClientProvider` envolve todas as rotas — qualquer componente pode usar `useQuery` e `useMutation`.

### 5. O auth guard

```tsx
// src/routes/_authed.tsx
function AuthedLayout() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPending && !session) {
      navigate({ to: "/login", replace: true });
    }
  }, [isPending, session, navigate]);

  if (isPending) return <Loading />;
  if (!session) return null;
  return <Outlet />;
}
```

Enquanto `isPending` é `true`, mostra loading. Se `session` é `null` após o load, redireciona. Se `session` existe, renderiza os filhos.

### 6. TanStack Query nos bookmarks

```ts
// src/hooks/use-bookmarks.ts
export function useBookmarks() {
  return useQuery({
    queryKey: ["bookmarks"],
    queryFn: () => api<Bookmark[]>("/api/bookmarks"),
  });
}

export function useDeleteBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api(`/api/bookmarks/${id}`, { method: "DELETE" }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["bookmarks"] });
      const anterior = qc.getQueryData(["bookmarks"]);
      qc.setQueryData(["bookmarks"], (old) => old?.filter((b) => b.id !== id));
      return { anterior };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.anterior) qc.setQueryData(["bookmarks"], ctx.anterior);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["bookmarks"] }),
  });
}
```

O padrão `onMutate` → `onError` → `onSettled` é o **optimistic update**: o card some antes da confirmação do server. Se falhar, volta. Se der certo, invalida o cache.

### 7. Rodar e conferir

```bash
bun db:start && bun db:migrate
bun dev
```

Fluxo: abra `/` → redireciona para `/login` → entre → vai para `/bookmarks` → crie, edite, exclua → faça logout → tente acessar `/bookmarks` direto → redireciona para `/login`.

## O que aprender

- **File-based routing**: cada arquivo em `src/routes/` vira uma rota. `_layout.tsx` é um layout pathless. A relação arquivo→URL é explícita.
- **Auth guard como layout**: uma única verificação no layout protege todas as rotas filhas. Não precisa lembrar de aplicar em cada uma.
- **TanStack Query vs fetch manual**: `useQuery` gerencia cache, loading e stale data. `useMutation` com invalidação garante que a lista sempre reflete o servidor.
- **Mutation otimista**: o `onMutate` atualiza o cache antes da resposta do server. O `onError` reverte se falhar. O `onSettled` invalida para garantir consistência.
- **Query keys**: uma chave simples (`["bookmarks"]`) basta quando o server filtra por usuário via cookie. Chaves compostas são úteis para prefetch.
- **`window.location.href` vs `navigate()`**: quando o estado do servidor (session cookie) muda, uma navegação forçada garante recarregamento limpo.

## Checklist

- [x] TanStack Router com file-based routing configurado
- [x] Rotas: `/`, `/login`, `/signup`, `/bookmarks`
- [x] Auth guard no layout `_authed.tsx` (redireciona se não logado)
- [x] Redirect pós-login para `/bookmarks`
- [x] TanStack Query para GET `/api/bookmarks`
- [x] Mutations para POST, PATCH, DELETE com invalidação de cache
- [x] Mutation otimista no delete (onMutate → onError → onSettled)
- [x] Logout funcional (signOut + navegação)
- [x] Decisões documentadas: query keys, quando invalidar, optimistic update
