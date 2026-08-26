import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

function obterTema(): "light" | "dark" {
  const salvo = localStorage.getItem("tema");
  if (salvo === "dark" || salvo === "light") return salvo;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function aplicarTema(tema: "light" | "dark") {
  document.documentElement.classList.toggle("dark", tema === "dark");
  localStorage.setItem("tema", tema);
}

export function ThemeToggle() {
  const [tema, setTema] = useState<"light" | "dark">("light");

  useEffect(() => {
    const inicial = obterTema();
    setTema(inicial);
    aplicarTema(inicial);
  }, []);

  function alternar() {
    const novo = tema === "light" ? "dark" : "light";
    setTema(novo);
    aplicarTema(novo);
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={alternar}
      aria-label={`Mudar para modo ${tema === "light" ? "escuro" : "claro"}`}
    >
      {tema === "light" ? <Moon /> : <Sun />}
    </Button>
  );
}
