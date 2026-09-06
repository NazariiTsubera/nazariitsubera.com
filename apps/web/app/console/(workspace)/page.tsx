import Link from "next/link";

import { env } from "@nazariitsubera/core/env";
import { previewDaysLeft } from "@nazariitsubera/core/sites";
import { vendorService } from "@nazariitsubera/core/vendors";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  captured: "Captured",
  generating: "Generating",
  preview_live: "Preview live",
  expired: "Expired",
  won: "Won",
  lost: "Lost",
  churned: "Churned",
};

export default async function ConsoleHome() {
  const vendors = await vendorService.list();
  const now = new Date();
  const rootDomain = env().SITE_ROOT_DOMAIN;

  if (vendors.length === 0) {
    return (
      <main className="flex flex-col items-start gap-4 p-6">
        <p className="ui-note">No captures yet.</p>
        <Link href="/console/new" className="ui-btn ui-btn-primary">
          Start the first one
        </Link>
      </main>
    );
  }

  return (
    <main className="flex flex-col divide-y divide-ink/10">
      {vendors.map((vendor) => {
        const daysLeft = previewDaysLeft(vendor.previewExpiresAt, now);
        return (
          <Link key={vendor.id} href={`/console/${vendor.id}`} className="flex min-h-[76px] flex-col justify-center gap-1 px-4 py-4 active:bg-ink/5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-serif text-lg leading-tight">{vendor.businessName}</span>
              <span className="shrink-0 font-mono text-xs uppercase tracking-wide text-mono">
                {STATUS_LABEL[vendor.status] ?? vendor.status}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-mono">
              {vendor.market ? <span>{vendor.market.name}</span> : null}
              <span>{vendor.createdAt.toLocaleDateString()}</span>
              {vendor.previewOpenedAt ? <span className="text-eyebrow">Opened</span> : null}
              {daysLeft !== null && vendor.status === "preview_live" ? <span>{daysLeft}d left</span> : null}
            </div>
            {vendor.publishedVersionId ? (
              <span className="text-xs text-faint">
                {vendor.slug}.{rootDomain}
              </span>
            ) : null}
          </Link>
        );
      })}
    </main>
  );
}
