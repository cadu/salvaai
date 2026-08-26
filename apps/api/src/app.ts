import { Hono } from "hono";
import { bookmarkRoutes } from "./bookmarks/routes";

export const app = new Hono();

app.get("/api/health", (c) => c.json({ status: "ok" }));

app.route("/api/bookmarks", bookmarkRoutes);
