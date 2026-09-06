import { marketRepository } from "@nazariitsubera/core/markets";
import { CONSENT_TEXT } from "@nazariitsubera/core/vendors";

import { NewVendorForm } from "@/components/console/NewVendorForm";

export const dynamic = "force-dynamic";

export default async function NewVendorPage() {
  const markets = await marketRepository.list();
  return <NewVendorForm markets={markets.map((m) => ({ id: m.id, name: m.name }))} consentText={CONSENT_TEXT} />;
}
