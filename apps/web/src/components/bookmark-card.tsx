import { Calendar, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { dataCurta, hostnameDe } from "@/lib/format";
import type { Bookmark } from "@/types";

export function BookmarkCard({
  bookmark,
  onEditar,
  onExcluir,
}: {
  bookmark: Bookmark;
  onEditar: (bookmark: Bookmark) => void;
  onExcluir: (bookmark: Bookmark) => void;
}) {
  return (
    <Card className="flex h-full flex-col gap-3 transition-shadow hover:shadow-md">
      <CardHeader>
        <CardDescription className="flex items-center gap-1">
          <ExternalLink className="size-3" />
          {hostnameDe(bookmark.url)}
        </CardDescription>
        <CardTitle className="leading-snug">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary hover:underline"
          >
            {bookmark.title}
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {bookmark.description && (
          <p className="text-muted-foreground text-sm leading-relaxed">{bookmark.description}</p>
        )}
      </CardContent>
      <CardFooter className="flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {bookmark.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground mr-2 inline-flex items-center gap-1 text-xs">
            <Calendar className="size-3" />
            {dataCurta(bookmark.createdAt)}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Editar ${bookmark.title}`}
            onClick={() => onEditar(bookmark)}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Excluir ${bookmark.title}`}
            onClick={() => onExcluir(bookmark)}
          >
            <Trash2 className="text-destructive" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
