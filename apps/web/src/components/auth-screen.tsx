import { useState } from "react";
import { Bookmark } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type Modo = "login" | "cadastro";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthScreen({
  initialMode = "login",
  onSuccess,
}: {
  initialMode?: Modo;
  onSuccess?: () => void;
}) {
  const [modo, setModo] = useState<Modo>(initialMode);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [erroServidor, setErroServidor] = useState<string | null>(null);

  const ehCadastro = modo === "cadastro";

  function validar(): boolean {
    const novos: Record<string, string> = {};
    if (ehCadastro && nome.trim().length < 2) novos.nome = "diga como podemos te chamar";
    if (!EMAIL_REGEX.test(email)) novos.email = "informe um email válido";
    if (senha.length < 8) novos.senha = "mínimo de 8 caracteres";
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErroServidor(null);
    if (!validar()) return;
    setEnviando(true);

    const result = ehCadastro
      ? await authClient.signUp.email({ email, password: senha, name: nome.trim() })
      : await authClient.signIn.email({ email, password: senha });

    if (result.error) {
      const msg = result.error?.message ?? "falha ao autenticar";
      if (msg.includes("already")) setErroServidor("email já cadastrado");
      else if (msg.includes("Invalid") || msg.includes("credentials"))
        setErroServidor("email ou senha incorretos");
      else setErroServidor(msg);
    } else {
      if (ehCadastro) {
        window.location.href = "/bookmarks";
      } else {
        onSuccess?.();
      }
    }
    setEnviando(false);
  }

  function trocarModo() {
    setModo(ehCadastro ? "login" : "cadastro");
    setErros({});
    setErroServidor(null);
  }

  return (
    <main className="bg-muted/40 flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="bg-primary text-primary-foreground mx-auto flex size-12 items-center justify-center rounded-xl">
            <Bookmark className="size-6" />
          </div>
          <CardTitle className="text-2xl">SalvaAí</CardTitle>
          <CardDescription>
            {ehCadastro
              ? "Crie sua conta para começar a salvar links"
              : "Entre para acessar seus bookmarks"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="form-auth" onSubmit={handleSubmit}>
            <FieldGroup>
              {ehCadastro && (
                <Field data-invalid={!!erros.nome || undefined}>
                  <FieldLabel htmlFor="nome">Nome</FieldLabel>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Maria Silva"
                    autoComplete="name"
                  />
                  {erros.nome && <FieldError>{erros.nome}</FieldError>}
                </Field>
              )}
              <Field data-invalid={!!erros.email || undefined}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maria@exemplo.com"
                  autoComplete="email"
                />
                {erros.email && <FieldError>{erros.email}</FieldError>}
              </Field>
              <Field data-invalid={!!erros.senha || undefined}>
                <FieldLabel htmlFor="senha">Senha</FieldLabel>
                <Input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={ehCadastro ? "new-password" : "current-password"}
                />
                {erros.senha ? (
                  <FieldError>{erros.senha}</FieldError>
                ) : (
                  ehCadastro && <FieldDescription>mínimo de 8 caracteres</FieldDescription>
                )}
              </Field>
              {erroServidor && <p className="text-destructive text-sm">{erroServidor}</p>}
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <Button type="submit" form="form-auth" className="w-full" disabled={enviando}>
            {enviando ? "Enviando..." : ehCadastro ? "Criar conta" : "Entrar"}
          </Button>
          <Button type="button" variant="link" size="sm" onClick={trocarModo}>
            {ehCadastro ? "Já tem conta? Faça login" : "Não tem conta? Cadastre-se"}
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
