import { PrismaClient } from "@prisma/client";

/**
 * Lazily-created Prisma client, cached on globalThis in development so HMR
 * doesn't exhaust connections. Created on first use — safe to import in
 * Phase 0 before DATABASE_URL exists.
 */
const globalForPrisma = globalThis as unknown as { almsbyPrisma?: PrismaClient };

export function getDb(): PrismaClient {
  if (!globalForPrisma.almsbyPrisma) {
    globalForPrisma.almsbyPrisma = new PrismaClient();
  }
  return globalForPrisma.almsbyPrisma;
}

