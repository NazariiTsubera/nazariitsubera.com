import { PrismaClient } from "@prisma/client";

export {
  AssetKind,
  AssetStatus,
  AuthoredBy,
  EventType,
  JobStatus,
  JobType,
  Prisma,
  TranscriptStatus,
  VendorStatus,
  VendorTier,
} from "@prisma/client";
export type { Asset, Capture, Event, Job, Market, SiteVersion, Vendor } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** One client per process. Cached on globalThis so Next's dev reloads do not leak connections. */
export const prisma: PrismaClient = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
