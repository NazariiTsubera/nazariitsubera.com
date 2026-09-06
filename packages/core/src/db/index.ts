import { PrismaClient } from "@prisma/client";

export { Prisma, AuthoredBy, EventType, VendorStatus, VendorTier } from "@prisma/client";
export type { Event, SiteVersion, Vendor } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** One client per process. Cached on globalThis so Next's dev reloads do not leak connections. */
export const prisma: PrismaClient = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
