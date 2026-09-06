import { NextResponse } from "next/server";

import { CONTENT_SCHEMA_VERSION } from "@nazariitsubera/core/contracts";
import { prisma } from "@nazariitsubera/core/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, db: true, contentSchemaVersion: CONTENT_SCHEMA_VERSION });
  } catch (error) {
    return NextResponse.json({ ok: false, db: false, error: (error as Error).message }, { status: 503 });
  }
}
