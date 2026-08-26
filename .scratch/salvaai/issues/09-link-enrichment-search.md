# 09: Link enrichment + search (cap-07-busca)

**What to build:** Funcionalidades que fazem o bookmark app valer a pena: ao salvar um link, o app busca favicon das meta tags; e dá pra buscar/filtrar os bookmarks por texto e tag.

**Blocked by:** 07 (integration layer)

**Status:** done

- [x] Favicon automático via Google Favicon API com fallback graceful
- [x] Busca por texto no título/descrição (client-side, `useMemo`)
- [x] Filtro por tag com botões toggle
- [x] Tags únicas extraídas automaticamente
- [x] Estado vazio contextual (filtro vazio vs sem bookmarks)
- [x] Decisões documentadas: enriquecimento client-side, por que não server-side
- [x] Doc: `docs/capitulos/cap-07-busca.md`
