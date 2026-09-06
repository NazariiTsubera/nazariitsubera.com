import { prisma } from "../db";
import { slugify } from "../hosting";

/** The San Antonio markets from the field playbook. Operator-editable later. */
export const SEED_MARKETS = [
  { name: "Pearl Farmers Market", city: "San Antonio", address: "312 Pearl Pkwy, San Antonio, TX 78215", scheduleNote: "Saturdays 9am to 1pm, Sundays 10am to 2pm" },
  { name: "Historic Market Square", city: "San Antonio", address: "514 W Commerce St, San Antonio, TX 78207", scheduleNote: "Daily 10am to 6pm" },
  { name: "Traders Village", city: "San Antonio", address: "9333 SW Loop 410, San Antonio, TX 78242", scheduleNote: "Saturdays and Sundays 8am to 6pm" },
  { name: "First Friday Southtown", city: "San Antonio", address: "S Alamo St, San Antonio, TX 78204", scheduleNote: "First Friday of the month, evenings" },
  { name: "Bulverde Market Days", city: "Bulverde", address: "Bulverde Community Park, Bulverde, TX 78163", scheduleNote: "Third Saturday, 9am to 3pm" },
  { name: "Boerne Market Days", city: "Boerne", address: "Main Plaza, Boerne, TX 78006", scheduleNote: "Second Saturday, 9am to 5pm" },
];

export const marketRepository = {
  list: () => prisma.market.findMany({ orderBy: { name: "asc" } }),
  get: (id: string) => prisma.market.findUnique({ where: { id } }),
};

/** Idempotent: upserts by slug so it is safe to run on every deploy. */
export async function seedMarkets(): Promise<number> {
  for (const market of SEED_MARKETS) {
    const slug = slugify(market.name);
    await prisma.market.upsert({ where: { slug }, update: { ...market }, create: { slug, ...market } });
  }
  return SEED_MARKETS.length;
}
