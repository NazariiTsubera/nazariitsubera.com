import { prisma } from "../src/db";
import { seedMarkets } from "../src/markets";

seedMarkets()
  .then((count) => console.log(`Seeded ${count} markets.`))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
