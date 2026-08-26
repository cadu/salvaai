import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_authed")({
  component: AuthedLayout,
});

function AuthedLayout() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPending && !session) {
      navigate({ to: "/login", replace: true });
    }
  }, [isPending, session, navigate]);

  if (isPending) {
    return (
      <p className="min-h-svh flex items-center justify-center text-muted-foreground">
        Carregando...
      </p>
    );
  }

  if (!session) return null;

  return <Outlet />;
}
