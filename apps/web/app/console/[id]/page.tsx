import { notFound } from "next/navigation";

import { captureService } from "@nazariitsubera/core/captures";
import { THEME_IDS } from "@nazariitsubera/core/contracts";
import { prisma } from "@nazariitsubera/core/db";
import { env } from "@nazariitsubera/core/env";
import { storage } from "@nazariitsubera/core/storage";
import { vendorService } from "@nazariitsubera/core/vendors";

import { GatePanel, type GateSummary } from "@/components/console/GatePanel";
import { PhotoGrid, type AssetRow } from "@/components/console/PhotoGrid";
import { Recorder } from "@/components/console/Recorder";
import { Timeline } from "@/components/console/Timeline";
import { VendorActions } from "@/components/console/VendorActions";
import { ContentEditor, RegeneratePanel, SettingsPanel } from "@/components/console/VendorPanels";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function VendorPage({ params }: Params) {
  const { id } = await params;
  const vendor = await vendorService.get(id);
  if (!vendor) notFound();

  const e = env();
  const capture = await captureService.latest(vendor.id);
  const events = await prisma.event.findMany({ where: { vendorId: vendor.id }, orderBy: { createdAt: "desc" }, take: 30 });
  const store = storage();

  const assets: AssetRow[] = vendor.assets.map((asset) => ({
    id: asset.id,
    kind: asset.kind,
    isHero: asset.isHero,
    orderIndex: asset.orderIndex,
    alt: asset.alt,
    previewUrl: store.publicUrl(asset.originalKey),
  }));

  const previewUrl = vendor.publishedVersionId ? `https://${vendor.slug}.${e.SITE_ROOT_DOMAIN}` : null;
  const marketName = vendor.market?.name ?? "the market";
  const smsBody =
    `Hey ${vendor.contactName ?? vendor.businessName}, this is ${e.OPERATOR_NAME} from ${marketName}. ` +
    `Here's your site: ${previewUrl ?? ""}/?p=${vendor.previewToken}. Took about 20 minutes. ` +
    `I'll swing back by in a bit, tell me what you think.`;

  return (
    <main className="flex flex-col gap-8 p-4 pb-24">
      <header>
        <h1 className="font-serif text-2xl leading-tight">{vendor.businessName}</h1>
        <p className="text-sm text-mono">
          {vendor.phone}
          {vendor.market ? ` · ${vendor.market.name}` : ""}
        </p>
      </header>

      <Recorder vendorId={vendor.id} captureId={capture?.id ?? null} prompt={capture?.operatorPrompt ?? null} />
      <PhotoGrid vendorId={vendor.id} assets={assets} />
      <VendorActions
        vendorId={vendor.id}
        status={vendor.status}
        previewUrl={previewUrl}
        previewToken={vendor.previewToken}
        smsBody={smsBody}
        phone={vendor.phone}
        hasPublished={Boolean(vendor.publishedVersionId)}
      />
      <GatePanel
        report={(vendor.publishedVersion?.gateReport ?? null) as GateSummary}
        authoredBy={vendor.publishedVersion?.authoredBy ?? null}
      />
      <RegeneratePanel vendorId={vendor.id} hasPublished={Boolean(vendor.publishedVersionId)} />
      <ContentEditor vendorId={vendor.id} content={vendor.publishedVersion?.contentJson ?? null} />
      <SettingsPanel
        vendorId={vendor.id}
        designNotes={vendor.designNotes}
        themeOverride={vendor.themeOverride}
        showInPortfolio={vendor.showInPortfolio}
        themeIds={THEME_IDS}
      />
      <Timeline events={events} />
    </main>
  );
}
