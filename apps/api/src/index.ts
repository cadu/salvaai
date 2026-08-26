import { app } from "./app";

const port = Number(process.env.PORT) || 3001;

console.log(`API rodando em http://localhost:${port}`);

Bun.serve({
  port,
  fetch: app.fetch,
});
