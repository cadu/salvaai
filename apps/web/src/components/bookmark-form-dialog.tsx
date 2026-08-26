import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Bookmark, BookmarkInput } from "@/types";

type Formulario = {
  title: string;
  url: string;
  description: string;
  tags: string;
};

const vazio: Formulario = { title: "", url: "", description: "", tags: "" };

function paraFormulario(bookmark: Bookmark | null): Formulario {
  if (!bookmark) return vazio;
  return {
    title: bookmark.title,
    url: bookmark.url,
    description: bookmark.description ?? "",
    tags: bookmark.tags.join(", "),
  };
}

export function BookmarkFormDialog({
  aberto,
  bookmark,
  onSalvar,
  onFechar,
}: {
  aberto: boolean;
  bookmark: Bookmark | null;
  onSalvar: (dados: BookmarkInput) => void;
  onFechar: () => void;
}) {
  const [form, setForm] = useState<Formulario>(vazio);
  const [erros, setErros] = useState<Record<string, string>>({});
  const ehEdicao = bookmark !== null;

  useEffect(() => {
    if (aberto) {
      setForm(paraFormulario(bookmark));
      setErros({});
    }
  }, [aberto, bookmark]);

  function validar(): boolean {
    const novosErros: Record<string, string> = {};
    if (!form.title.trim()) novosErros.title = "o título é obrigatório";
    try {
      const parsed = new URL(form.url);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        novosErros.url = "use uma URL http ou https";
      }
    } catch {
      novosErros.url = "informe uma URL válida";
    }
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validar()) return;
    onSalvar({
      title: form.title.trim(),
      url: form.url.trim(),
      description: form.description.trim() || null,
      tags: form.tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    });
  }

  function atualizar(campo: keyof Formulario, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  return (
    <Dialog open={aberto} onOpenChange={(open) => !open && onFechar()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{ehEdicao ? "Editar bookmark" : "Novo bookmark"}</DialogTitle>
          <DialogDescription>
            {ehEdicao
              ? "Ajuste as informações do link salvo."
              : "Salve um link para acessar depois."}
          </DialogDescription>
        </DialogHeader>
        <form id="form-bookmark" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field data-invalid={!!erros.title || undefined}>
              <FieldLabel htmlFor="bm-title">Título</FieldLabel>
              <Input
                id="bm-title"
                value={form.title}
                onChange={(e) => atualizar("title", e.target.value)}
                placeholder="MDN Web Docs"
              />
              {erros.title && <FieldError>{erros.title}</FieldError>}
            </Field>
            <Field data-invalid={!!erros.url || undefined}>
              <FieldLabel htmlFor="bm-url">URL</FieldLabel>
              <Input
                id="bm-url"
                value={form.url}
                onChange={(e) => atualizar("url", e.target.value)}
                placeholder="https://developer.mozilla.org"
              />
              {erros.url && <FieldError>{erros.url}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="bm-description">Descrição</FieldLabel>
              <Textarea
                id="bm-description"
                value={form.description}
                onChange={(e) => atualizar("description", e.target.value)}
                placeholder="Por que esse link vale a pena?"
                rows={3}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="bm-tags">Tags</FieldLabel>
              <Input
                id="bm-tags"
                value={form.tags}
                onChange={(e) => atualizar("tags", e.target.value)}
                placeholder="react, ui"
              />
              <FieldDescription>separadas por vírgula</FieldDescription>
            </Field>
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onFechar}>
            Cancelar
          </Button>
          <Button type="submit" form="form-bookmark">
            {ehEdicao ? "Salvar alterações" : "Salvar bookmark"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
