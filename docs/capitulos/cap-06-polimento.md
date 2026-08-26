# Capítulo 6 — Polimento

> **Objetivo:** ao fim deste capítulo, o app parece um produto real: feedback em tempo real via toasts, dark mode que respeita a preferência do sistema e persiste, estados de loading com skeleton, e estados vazios com call-to-action claro.

## Decisões

| Decisão                          | Alternativas                             | Por quê                                                                                                                                                     |
| -------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sonner para toasts               | react-toastify, toast manual             | Sonner é leve (~3kB), tem API simples e visual elegante. Basta `<Toaster />` no root e `toast.success()` nos handlers.                                      |
| `localStorage` para tema         | Cookie ou preferência do servidor        | Tema é puramente client-side. `localStorage` é simples, sincronizado entre abas, e não precisa de round-trip ao server.                                     |
| Script anti-FOUC no `<head>`     | CSS `@media (prefers-color-scheme)`      | O script aplica `.dark` antes do React montar — evita flash de tema claro na primeira carga. CSS alone não resolve para usuários que já escolheram um tema. |
| Skeleton grid de 6 cards         | Spinner ou skeleton linear               | O grid de 6 cards espelha o layout real — o usuário vê a estrutura da lista antes dos dados chegarem. Mais natural que um spinner genérico.                 |
| `invalidateQueries` em mutations | Refetch manual ou stale-while-revalidate | invalidation garante que os dados estejam sempre consistentes com o server. Não precisa de lógica manual de refresh.                                        |

## Passo a passo

### 1. Sonner para toasts

```bash
bun add sonner
```

No root layout:

```tsx
import { Toaster } from "sonner";

function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
```

Nos hooks de mutation:

```ts
import { toast } from "sonner";

export function useCreateBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dados) => api("/api/bookmarks", { method: "POST", body: JSON.stringify(dados) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookmarksKey });
      toast.success("Bookmark criado!");
    },
    onError: () => toast.error("Erro ao criar bookmark"),
  });
}
```

> **Prompt:** _"Adicione feedback visual com toasts para sucesso/erro de mutations num app React com TanStack Query."_

### 2. Dark mode

Componente `ThemeToggle`:

```ts
function obterTema(): "light" | "dark" {
  const salvo = localStorage.getItem("tema");
  if (salvo === "dark" || salvo === "light") return salvo;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function aplicarTema(tema: "light" | "dark") {
  document.documentElement.classList.toggle("dark", tema === "dark");
  localStorage.setItem("tema", tema);
}
```

Script anti-FOUC no `index.html`:

```html
<script>
  (function () {
    var t = localStorage.getItem("tema");
    if (t === "dark" || (!t && matchMedia("(prefers-color-scheme:dark)").matches)) {
      document.documentElement.classList.add("dark");
    }
  })();
</script>
```

O `useEffect` no componente sincroniza o estado React com o DOM. O script no `<head>` aplica o tema antes do React montar — evita flash.

### 3. Skeleton loading

```tsx
{isLoading ? (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <Card key={i}>
        <CardContent className="flex h-44 flex-col gap-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="mt-auto h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </CardContent>
      </Card>
    ))}
  </div>
)
```

6 cards com dimensões que espelham o layout real. O `Skeleton` do shadcn tem animação `pulse` por padrão.

### 4. Estado vazio

```tsx
<div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-20 text-center">
  <SearchX className="size-10" />
  <p className="font-medium">Nenhum bookmark ainda</p>
  <p className="max-w-xs text-sm">
    Salve seu primeiro link clicando em "Novo bookmark" — ele aparece aqui na hora.
  </p>
  <Button variant="outline" size="sm" onClick={abrirCriar}>
    <Plus /> Salvar primeiro link
  </Button>
</div>
```

Ícone + título + descrição + CTA. O usuário sabe exatamente o que fazer.

## O que aprender

- **Toasts como feedback**: toast.success/erro nos callbacks de mutation. O usuário vê o resultado sem precisar adivinhar se funcionou.
- **Dark mode com persistência**: `localStorage` + `prefers-color-scheme` + script anti-FOUC. O tema é aplicado antes do React montar para evitar flash.
- **Skeleton como layout preview**: skeleton com dimensões reais do conteúdo. Mais informativo que um spinner genérico.
- **Empty states como onboarding**: estado vazio com CTA claro. O usuário não fica perdido quando não há dados.
- **Anti-FOUC script**: script inline no `<head>` que aplica a classe `.dark` antes do CSS e JS carregarem.

## Checklist

- [x] Toasts em sucesso/erro de todas as mutations (criar, editar, excluir)
- [x] Dark mode funcional com preferência persistida em localStorage
- [x] Anti-FOUC script no index.html
- [x] Skeleton loading com grid de 6 cards
- [x] Estado vazio com call-to-action ("Salvar primeiro link")
- [x] Doc: `docs/capitulos/cap-06-polimento.md`
