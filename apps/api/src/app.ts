import { Hono } from "hono";
import { auth } from "./auth";
import { bookmarkRoutes } from "./bookmarks/routes";

export const app = new Hono();

app.get("/api/health", (c) => c.json({ status: "ok" }));

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

app.route("/api/bookmarks", bookmarkRoutes);
