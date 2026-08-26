import type { Bookmark } from "@/types";

const agora = Date.now();
const dias = (n: number) => new Date(agora - n * 24 * 60 * 60 * 1000).toISOString();

export const bookmarksIniciais: Bookmark[] = [
  {
    id: "c56d9f2e-1a3b-4c5d-8e9f-0a1b2c3d4e5f",
    title: "MDN Web Docs",
    url: "https://developer.mozilla.org",
    description: "A referência canônica de HTML, CSS e JavaScript.",
    tags: ["referencia", "web"],
    createdAt: dias(12),
  },
  {
    id: "7f6e5d4c-3b2a-4918-8071-6f5e4d3c2b1a",
    title: "TanStack Query docs",
    url: "https://tanstack.com/query/latest",
    description: "Gerenciamento de estado assíncrono: cache, refetch e invalidação.",
    tags: ["react", "estado"],
    createdAt: dias(7),
  },
  {
    id: "2b1a0987-6543-4fed-cba9-877655443322",
    title: "Drizzle ORM — Migrations",
    url: "https://orm.drizzle.team/docs/migrations",
    description: null,
    tags: ["banco", "sql"],
    createdAt: dias(4),
  },
  {
    id: "aa11bb22-cc33-4d44-8e55-ff66aa77bb88",
    title: "shadcn/ui",
    url: "https://ui.shadcn.com",
    description: "Componentes copiáveis que vivem no seu projeto, não numa biblioteca.",
    tags: ["react", "ui"],
    createdAt: dias(1),
  },
];

export function esperar(ms = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
