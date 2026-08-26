import { authClient } from "@/lib/auth-client";
import { BookmarksPage } from "@/components/bookmarks-page";
import { AuthScreen } from "@/components/auth-screen";

export default function App() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <p className="min-h-svh flex items-center justify-center text-muted-foreground">
        Carregando...
      </p>
    );
  }

  const usuario = session?.user ?? null;

  return usuario ? (
    <BookmarksPage
      usuario={usuario}
      onSair={() => authClient.signOut().then(() => window.location.reload())}
    />
  ) : (
    <AuthScreen />
  );
}
