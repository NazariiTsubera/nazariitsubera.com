import { NextResponse } from "next/server";
import { z } from "zod";

import { UnauthorizedError } from "@nazariitsubera/core/auth";

import { requireOperator } from "./operator";

/**
 * Every console handler runs through this: authenticate, validate, call a service, map errors.
 * Keeps the route files to a few lines each.
 */
export async function handle<T>(work: () => Promise<T>): Promise<NextResponse> {
  try {
    await requireOperator();
    return NextResponse.json((await work()) ?? { ok: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", issues: z.treeifyError(error) }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
