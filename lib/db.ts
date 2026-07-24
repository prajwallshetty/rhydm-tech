import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * Prisma 7 no longer reads DATABASE_URL implicitly — the client must be
 * constructed with a driver adapter.
 */
function createClient() {
  let connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and fill it in.",
    );
  }

  if (connectionString.includes("sslmode=require") && !connectionString.includes("uselibpqcompat=")) {
    connectionString += (connectionString.includes("?") ? "&" : "?") + "uselibpqcompat=true";
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/**
 * Next.js hot-reloads modules in development, which would otherwise create a
 * new client (and a new connection pool) on every reload until the database
 * refuses connections. Caching on globalThis keeps a single instance.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createClient> | undefined;
};

// Create a proxy/mock Prisma client for build-time when DATABASE_URL is missing.
const createMockClient = () => {
  const mock: any = new Proxy({} as any, {
    get(target, prop) {
      if (prop === "$connect" || prop === "$disconnect") {
        return () => Promise.resolve();
      }
      if (prop === "$transaction") {
        return (cb: any) => {
          if (typeof cb === "function") {
            return cb(mock);
          }
          return Promise.resolve([]);
        };
      }
      return new Proxy(() => {}, {
        get(t, p) {
          if (typeof p === "string" && (p.startsWith("find") || p.startsWith("count") || p === "groupBy" || p === "aggregate")) {
            return async () => {
              console.warn(`[Prisma Mock] DATABASE_URL is not set. Mocking ${String(prop)}.${p} during build.`);
              if (p.startsWith("count")) return 0;
              return [];
            };
          }
          return mock;
        },
        apply(t, thisArg, args) {
          return Promise.resolve();
        }
      });
    }
  });
  return mock as PrismaClient;
};

const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
const hasDbUrl = !!process.env.DATABASE_URL;

let prismaInstance: PrismaClient;

if (isBuildPhase && !hasDbUrl) {
  prismaInstance = createMockClient();
} else {
  // If it's runtime (or build phase with a DB URL), we initialize the real client.
  // Note: we defer initialization of the real client to avoid crashing at top-level import
  // if DATABASE_URL is missing but this module is imported.
  prismaInstance = new Proxy({} as any, {
    get(target, prop, receiver) {
      const actualClient = globalForPrisma.prisma ?? createClient();
      if (process.env.NODE_ENV !== "production") {
        globalForPrisma.prisma = actualClient;
      }
      return Reflect.get(actualClient, prop, receiver);
    }
  }) as PrismaClient;
}

export const db = prismaInstance;
