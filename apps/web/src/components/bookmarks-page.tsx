import { useMemo, useState } from "react";
import { Bookmark, LogOut, Plus, Search, SearchX, X } from "lucide-react";
import { BookmarkCard } from "@/components/bookmark-card";
import { BookmarkFormDialog } from "@/components/bookmark-form-dialog";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import {
  useBookmarks,
  useCreateBookmark,
  useUpdateBookmark,
  useDeleteBookmark,
} from "@/hooks/use-bookmarks";
import type { Bookmark as BookmarkTipo, BookmarkInput } from "@/types";

export function BookmarksPage() {
  const { data: session } = authClient.useSession();
  const usuario = session?.user;

  const { data: bookmarks = [], isLoading } = useBookmarks();
  const criarMutation = useCreateBookmark();
  const atualizarMutation = useUpdateBookmark();
  const excluirMutation = useDeleteBookmark();

  const [formAberto, setFormAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<BookmarkTipo | null>(null);
  const [paraExcluir, setParaExcluir] = useState<BookmarkTipo | null>(null);
  const [busca, setBusca] = useState("");
  const [tagFiltro, setTagFiltro] = useState<string | null>(null);

  const tagsDisponiveis = useMemo(() => {
    const tags = new Set<string>();
    for (const b of bookmarks) {
      for (const t of b.tags) tags.add(t);
    }
    return Array.from(tags).sort();
  }, [bookmarks]);

  const bookmarksFiltrados = useMemo(() => {
    let resultado = bookmarks;
    if (busca.trim()) {
      const q = busca.toLowerCase();
      resultado = resultado.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          (b.description && b.description.toLowerCase().includes(q)),
      );
    }
    if (tagFiltro) {
      resultado = resultado.filter((b) => b.tags.includes(tagFiltro));
    }
    return resultado;
  }, [bookmarks, busca, tagFiltro]);

  function abrirCriar() {
    setEmEdicao(null);
    setFormAberto(true);
  }

  function abrirEditar(bookmark: BookmarkTipo) {
    setEmEdicao(bookmark);
    setFormAberto(true);
  }

  function salvar(dados: BookmarkInput) {
    if (emEdicao) {
      atualizarMutation.mutate(
        { id: emEdicao.id, dados },
        {
          onSuccess: () => {
            setFormAberto(false);
            setEmEdicao(null);
          },
        },
      );
    } else {
      criarMutation.mutate(dados, {
        onSuccess: () => {
          setFormAberto(false);
          setEmEdicao(null);
        },
      });
    }
  }

  function excluir(bookmark: BookmarkTipo) {
    excluirMutation.mutate(bookmark.id, {
      onSuccess: () => setParaExcluir(null),
    });
  }

  return (
    <div className="bg-muted/40 min-h-svh">
      <header className="bg-background border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
              <Bookmark className="size-4" />
            </div>
            <span className="text-lg font-semibold">SalvaAí</span>
          </div>
          <div className="flex items-center gap-1">
            {usuario && (
              <Badge variant="outline" className="hidden sm:inline-flex">
                {usuario.email}
              </Badge>
            )}
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                authClient.signOut().then(() => {
                  window.location.href = "/login";
                })
              }
            >
              <LogOut data-icon="inline-start" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Seus bookmarks</h1>
            <p className="text-muted-foreground text-sm">
              {isLoading
                ? "carregando..."
                : `${bookmarks.length} ${bookmarks.length === 1 ? "link salvo" : "links salvos"}`}
            </p>
          </div>
          <Button onClick={abrirCriar}>
            <Plus data-icon="inline-start" />
            Novo bookmark
          </Button>
        </div>

        {bookmarks.length > 0 && (
          <div className="mb-6 space-y-3">
            <div className="relative">
              <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input
                placeholder="Buscar por título ou descrição..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9"
              />
              {busca && (
                <button
                  onClick={() => setBusca("")}
                  className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            {tagsDisponiveis.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <Button
                  variant={tagFiltro === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTagFiltro(null)}
                >
                  Todos
                </Button>
                {tagsDisponiveis.map((tag) => (
                  <Button
                    key={tag}
                    variant={tagFiltro === tag ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTagFiltro(tagFiltro === tag ? null : tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

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
        ) : bookmarksFiltrados.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center gap-3 rounded-xl border border-dashed py-20 text-center">
            <SearchX className="size-10" />
            <p className="font-medium">Nenhum resultado</p>
            <p className="max-w-xs text-sm">
              {busca || tagFiltro
                ? "Tente buscar por outros termos ou remova o filtro de tag."
                : 'Salve seu primeiro link clicando em "Novo bookmark" — ele aparece aqui na hora.'}
            </p>
            {!busca && !tagFiltro && (
              <Button variant="outline" size="sm" onClick={abrirCriar}>
                <Plus data-icon="inline-start" />
                Salvar primeiro link
              </Button>
            )}
          </div>
        ) : (
          <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bookmarksFiltrados.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                onEditar={abrirEditar}
                onExcluir={setParaExcluir}
              />
            ))}
          </div>
        )}
      </main>

      <BookmarkFormDialog
        aberto={formAberto}
        bookmark={emEdicao}
        onSalvar={salvar}
        onFechar={() => {
          setFormAberto(false);
          setEmEdicao(null);
        }}
      />
      <ConfirmDeleteDialog
        bookmark={paraExcluir}
        onConfirmar={excluir}
        onCancelar={() => setParaExcluir(null)}
      />
    </div>
  );
}
