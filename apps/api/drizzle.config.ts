import { defineConfig } from "drizzle-kit";
import { DATABASE_URL } from "./src/db/config";

export default defineConfig({
  out: "./drizzle",
  schema: ["./src/db/schema.ts", "./src/db/auth-schema.ts"],
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});
