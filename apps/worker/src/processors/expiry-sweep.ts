import { createLogger } from "@nazariitsubera/core/logger";
import { siteService } from "@nazariitsubera/core/sites";

const log = createLogger({ processor: "expiry_sweep" });

/** Moves previews past their date to expired, and won vendors past their grace date to churned. */
export async function runExpirySweep(): Promise<{ expired: number; churned: number }> {
  const result = await siteService.expirePreviews();
  if (result.expired || result.churned) log.info(result, "sweep changed vendor states");
  return result;
}
