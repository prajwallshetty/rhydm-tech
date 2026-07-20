// Prisma 7 moved the datasource URL out of schema.prisma and into this file.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
    // Used only by `prisma migrate dev` to detect schema drift.
    shadowDatabaseUrl: process.env["SHADOW_DATABASE_URL"],
  },
});
