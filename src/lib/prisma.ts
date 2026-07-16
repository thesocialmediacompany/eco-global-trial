import { PrismaClient } from "@prisma/client";

/**
 * Transient connection errors thrown when Neon's compute is waking from
 * auto-suspend. These mean the query never reached the database, so retrying is
 * safe (no risk of double-applying a write). Retrying turns a cold-start from a
 * 5xx error into a slightly slower first request instead.
 */
function isColdStart(e: unknown): boolean {
  const code = (e as { code?: string })?.code;
  if (code === "P1001" || code === "P1002" || code === "P1017") return true;
  const msg = String((e as { message?: string })?.message ?? "");
  return /can'?t reach database|connection.*closed|ECONNRESET|ETIMEDOUT|terminating connection|server has closed/i.test(
    msg,
  );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function createPrisma() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  }).$extends({
    query: {
      async $allOperations({ args, query }) {
        let lastErr: unknown;
        // ~6s total across 5 tries — comfortably covers Neon's wake time.
        for (let attempt = 0; attempt < 5; attempt++) {
          try {
            return await query(args);
          } catch (e) {
            if (!isColdStart(e)) throw e;
            lastErr = e;
            await sleep(400 * (attempt + 1));
          }
        }
        throw lastErr;
      },
    },
  });
}

// Reuse a single client across hot-reloads in development.
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrisma> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
