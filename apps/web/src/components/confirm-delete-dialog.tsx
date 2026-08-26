import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Bookmark } from "@/types";

export function ConfirmDeleteDialog({
  bookmark,
  onConfirmar,
  onCancelar,
}: {
  bookmark: Bookmark | null;
  onConfirmar: (bookmark: Bookmark) => void;
  onCancelar: () => void;
}) {
  return (
    <AlertDialog open={bookmark !== null} onOpenChange={(open) => !open && onCancelar()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir bookmark?</AlertDialogTitle>
          <AlertDialogDescription>
            {bookmark && (
              <>
                "{bookmark.title}" será removido permanentemente. Essa ação não pode ser desfeita.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancelar}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={() => bookmark && onConfirmar(bookmark)}
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
