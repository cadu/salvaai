import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthScreen } from "@/components/auth-screen";

export const Route = createFileRoute("/signup")({
  component: SignupRoute,
});

function SignupRoute() {
  const navigate = useNavigate();
  return <AuthScreen initialMode="cadastro" onSuccess={() => navigate({ to: "/bookmarks" })} />;
}
