import { type Prisma, prisma, type VendorStatus } from "../db";

export const vendorRepository = {
  get: (id: string) =>
    prisma.vendor.findUnique({
      where: { id },
      include: { market: true, publishedVersion: true, assets: { orderBy: { orderIndex: "asc" } }, captures: { orderBy: { createdAt: "desc" } } },
    }),

  bySlug: (slug: string) => prisma.vendor.findUnique({ where: { slug } }),

  list: (where: Prisma.VendorWhereInput = {}) =>
    prisma.vendor.findMany({ where, orderBy: { createdAt: "desc" }, include: { market: true } }),

  create: (data: Prisma.VendorCreateInput) => prisma.vendor.create({ data }),

  update: (id: string, data: Prisma.VendorUpdateInput) => prisma.vendor.update({ where: { id }, data }),

  setStatus: (id: string, status: VendorStatus) => prisma.vendor.update({ where: { id }, data: { status } }),
};

export type VendorWithRelations = NonNullable<Awaited<ReturnType<typeof vendorRepository.get>>>;
export type VendorListRow = Awaited<ReturnType<typeof vendorRepository.list>>[number];
