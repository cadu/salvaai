# Capítulo 7 — Busca e Filtros

> **Objetivo:** ao fim deste capítulo, o app tem favicon automático em cada card, busca por texto no título/descrição, e filtro por tag — tudo client-side, sem chamada extra ao servidor.

## Decisões

| Decisão                         | Alternativas                                    | Por quê                                                                                                                                                |
| ------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Favicon via Google Favicon API  | Proxy server-side, `<link rel="icon">` scraping | A API do Google é pública, não precisa de backend. Basta `https://www.google.com/s2/favicons?domain=X&sz=32`. Se falhar, o `onError` esconde a imagem. |
| Busca client-side               | Filtro server-side com query param              | Para poucos bookmarks (<100), filter no array é instantâneo e não precisa de debounce. Em escala real, seria server-side com índice full-text.         |
| Filtro por tag client-side      | Tag como query param na API                     | Mesmo raciocínio da busca: com dezenas de bookmarks, filter no array é suficiente. O学生 vê o padrão `useMemo` com dependências.                       |
| Tags como botões (não dropdown) | Combobox ou select múltiplo                     | Botões são mais visuais e diretos. O aluno vê imediatamente quais tags existem e qual está ativa. Dropdown seria mais compacto mas menos didático.     |
| `onError` no `<img>` do favicon | Fallback server-side ou placeholder SVG         | Se o favicon não carrega, o `onError` esconde o `<img>`. Mais simples que servidor de fallback. O card fica sem favicon mas sem erro visual.           |

## Passo a passo

### 1. Favicon automático

Função helper:

```ts
export function faviconUrl(url: string): string {
  try {
    const dominio = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${dominio}&sz=32`;
  } catch {
    return "";
  }
}
```

No `BookmarkCard`:

```tsx
{
  faviconUrl(bookmark.url) && (
    <img
      src={faviconUrl(bookmark.url)}
      alt=""
      className="size-4 rounded-sm"
      loading="lazy"
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  );
}
```

O `loading="lazy"` evita requests desnecessários. O `onError` esconde se o favicon não existir.

> **Prompt:** _"Adicione favicon automático nos cards de bookmarks usando a API do Google Favicon."_

### 2. Busca por texto

```tsx
const [busca, setBusca] = useState("");

const bookmarksFiltrados = useMemo(() => {
  if (!busca.trim()) return bookmarks;
  const q = busca.toLowerCase();
  return bookmarks.filter(
    (b) =>
      b.title.toLowerCase().includes(q) ||
      (b.description && b.description.toLowerCase().includes(q)),
  );
}, [bookmarks, busca]);
```

Input com ícone de lupa e botão X para limpar:

```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2" />
  <Input placeholder="Buscar..." value={busca} onChange={...} className="pl-9" />
  {busca && <button onClick={() => setBusca("")}><X /></button>}
</div>
```

### 3. Filtro por tag

```tsx
const tagsDisponiveis = useMemo(() => {
  const tags = new Set<string>();
  for (const b of bookmarks) for (const t of b.tags) tags.add(t);
  return Array.from(tags).sort();
}, [bookmarks]);
```

Botões de tag com estado ativo:

```tsx
<Button variant={tagFiltro === null ? "default" : "outline"} onClick={() => setTagFiltro(null)}>
  Todos
</Button>;
{
  tagsDisponiveis.map((tag) => (
    <Button
      variant={tagFiltro === tag ? "default" : "outline"}
      onClick={() => setTagFiltro(tagFiltro === tag ? null : tag)}
    >
      {tag}
    </Button>
  ));
}
```

A lógica é toggle: clicar numa tag ativa desativa o filtro.

### 4. Estado vazio contextual

```tsx
{bookmarksFiltrados.length === 0 ? (
  <div>
    <p>Nenhum resultado</p>
    <p>{busca || tagFiltro
      ? "Tente buscar por outros termos ou remova o filtro de tag."
      : "Salve seu primeiro link..."}
    </p>
  </div>
)
```

Duas mensagens diferentes: uma quando o filtro não retorna nada, outra quando não há bookmarks.

## O que aprender

- **Favicon sem backend**: API pública do Google. Se não existir, `onError` esconde. Sem fallback complexo.
- **Busca client-side**: `useMemo` com `busca` como dependência. Filtra por título e descrição. Para poucos dados, não precisa de debounce nem de servidor.
- **Filtro por tag**: Extrai tags únicas com `Set`, renderiza como botões toggle. Toggle: clicar na tag ativa desativa.
- **Estado vazio contextual**: Mensagem muda dependendo se há busca/filtro ativo ou não. O usuário entende o que aconteceu.
- **`loading="lazy"` no `<img>`**: Evita requests desnecessários para favicons que estão fora da viewport.

## Checklist

- [x] Favicon automático via Google Favicon API com `onError` graceful
- [x] Busca por texto no título e descrição com `useMemo`
- [x] Filtro por tag com botões toggle
- [x] Tags únicas extraídas automaticamente
- [x] Estado vazio contextual (filtro vazio vs sem bookmarks)
- [x] Doc: `docs/capitulos/cap-07-busca.md`
