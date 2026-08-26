import { Navigate, createFileRoute } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/")({
  component: IndexRoute,
});

function IndexRoute() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <p className="min-h-svh flex items-center justify-center text-muted-foreground">
        Carregando...
      </p>
    );
  }

  return session ? <Navigate to="/bookmarks" replace /> : <Navigate to="/login" replace />;
}
