import { useEffect, useState } from "react";
import { Bookmark, LogOut, Plus, SearchX } from "lucide-react";
import { BookmarkCard } from "@/components/bookmark-card";
import { BookmarkFormDialog } from "@/components/bookmark-form-dialog";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Bookmark as BookmarkTipo, BookmarkInput, Usuario } from "@/types";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: "include", ...init });
  if (res.status === 204) return undefined as T;
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.message ?? "erro na API");
  return body as T;
}

export function BookmarksPage({ usuario, onSair }: { usuario: Usuario; onSair: () => void }) {
  const [bookmarks, setBookmarks] = useState<BookmarkTipo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [formAberto, setFormAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<BookmarkTipo | null>(null);
  const [paraExcluir, setParaExcluir] = useState<BookmarkTipo | null>(null);

  async function carregar() {
    const data = await api<BookmarkTipo[]>("/api/bookmarks");
    setBookmarks(data);
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  function abrirCriar() {
    setEmEdicao(null);
    setFormAberto(true);
  }

  function abrirEditar(bookmark: BookmarkTipo) {
    setEmEdicao(bookmark);
    setFormAberto(true);
  }

  async function salvar(dados: BookmarkInput) {
    if (emEdicao) {
      await api(`/api/bookmarks/${emEdicao.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(dados),
      });
    } else {
      await api("/api/bookmarks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(dados),
      });
    }
    setFormAberto(false);
    setEmEdicao(null);
    await carregar();
  }

  async function excluir(bookmark: BookmarkTipo) {
    await api(`/api/bookmarks/${bookmark.id}`, { method: "DELETE" });
    setParaExcluir(null);
    await carregar();
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
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:inline-flex">
              {usuario.email}
            </Badge>
            <Button variant="ghost" size="sm" onClick={onSair}>
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
              {carregando
                ? "carregando..."
                : `${bookmarks.length} ${bookmarks.length === 1 ? "link salvo" : "links salvos"}`}
            </p>
          </div>
          <Button onClick={abrirCriar}>
            <Plus data-icon="inline-start" />
            Novo bookmark
          </Button>
        </div>

        {carregando ? (
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
        ) : bookmarks.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center gap-3 rounded-xl border border-dashed py-20 text-center">
            <SearchX className="size-10" />
            <p className="font-medium">Nenhum bookmark ainda</p>
            <p className="max-w-xs text-sm">
              Salve seu primeiro link clicando em "Novo bookmark" — ele aparece aqui na hora.
            </p>
            <Button variant="outline" size="sm" onClick={abrirCriar}>
              <Plus data-icon="inline-start" />
              Salvar primeiro link
            </Button>
          </div>
        ) : (
          <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bookmarks.map((bookmark) => (
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
