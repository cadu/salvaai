import { useState } from "react";
import { Bookmark } from "lucide-react";
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
import type { Usuario } from "@/types";

type Modo = "login" | "cadastro";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthScreen({ onEntrar }: { onEntrar: (usuario: Usuario) => void }) {
  const [modo, setModo] = useState<Modo>("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);

  const ehCadastro = modo === "cadastro";

  function validar(): boolean {
    const novosErros: Record<string, string> = {};
    if (ehCadastro && nome.trim().length < 2) {
      novosErros.nome = "diga como podemos te chamar";
    }
    if (!EMAIL_REGEX.test(email)) {
      novosErros.email = "informe um email válido";
    }
    if (senha.length < 8) {
      novosErros.senha = "mínimo de 8 caracteres";
    }
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validar()) return;
    setEnviando(true);
    await new Promise((r) => setTimeout(r, 600));
    const apelido = nome.trim() || email.split("@")[0] || "usuário";
    onEntrar({ name: apelido, email });
    setEnviando(false);
  }

  function trocarModo() {
    setModo(ehCadastro ? "login" : "cadastro");
    setErros({});
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
                  {erros.nome ? <FieldError>{erros.nome}</FieldError> : undefined}
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
