import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthScreen } from "@/components/auth-screen";

export const Route = createFileRoute("/login")({
  component: LoginRoute,
});

function LoginRoute() {
  const navigate = useNavigate();
  return <AuthScreen onSuccess={() => navigate({ to: "/bookmarks" })} />;
}
