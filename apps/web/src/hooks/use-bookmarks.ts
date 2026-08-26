import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Bookmark, BookmarkInput } from "@/types";

export const bookmarksKey = ["bookmarks"] as const;

export function useBookmarks() {
  return useQuery({
    queryKey: bookmarksKey,
    queryFn: () => api<Bookmark[]>("/api/bookmarks"),
  });
}

export function useCreateBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dados: BookmarkInput) =>
      api<Bookmark>("/api/bookmarks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(dados),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookmarksKey });
      toast.success("Bookmark criado!");
    },
    onError: () => toast.error("Erro ao criar bookmark"),
  });
}

export function useUpdateBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dados }: { id: string; dados: Partial<BookmarkInput> }) =>
      api<Bookmark>(`/api/bookmarks/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(dados),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookmarksKey });
      toast.success("Bookmark atualizado!");
    },
    onError: () => toast.error("Erro ao atualizar bookmark"),
  });
}

export function useDeleteBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/api/bookmarks/${id}`, { method: "DELETE" }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: bookmarksKey });
      const anterior = qc.getQueryData<Bookmark[]>(bookmarksKey);
      qc.setQueryData<Bookmark[]>(bookmarksKey, (old) => old?.filter((b) => b.id !== id) ?? []);
      return { anterior };
    },
    onError: (_err, _id, contexto) => {
      if (contexto?.anterior) {
        qc.setQueryData(bookmarksKey, contexto.anterior);
      }
      toast.error("Erro ao excluir bookmark");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: bookmarksKey }),
  });
}
