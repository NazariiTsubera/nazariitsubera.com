import { NextResponse } from "next/server";

import { CONTENT_SCHEMA_VERSION } from "@nazariitsubera/core/contracts";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ ok: true, contentSchemaVersion: CONTENT_SCHEMA_VERSION });
}
