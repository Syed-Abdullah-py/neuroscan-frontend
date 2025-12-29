import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

/**
 * Global Prisma Client instance.
 * 
 * Used to ensure only a single instance of Prisma Client is instantiated
 * during development to prevent connection exhaustion with hot reloading.
 * In production, it simply creates a regular instance.
 */
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;