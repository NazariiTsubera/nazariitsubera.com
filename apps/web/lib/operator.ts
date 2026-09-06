import { headers } from "next/headers";

import { auth } from "@nazariitsubera/core/auth";
import { type OperatorSession, operatorFrom } from "@nazariitsubera/core/auth";

async function load(): Promise<OperatorSession | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ? { user: { id: session.user.id, email: session.user.email } } : null;
}

/** Throws UnauthorizedError when signed out. Route handlers map that to a 401. */
export const requireOperator = () => operatorFrom(load);

/** Null when signed out, for pages that redirect rather than throw. */
export const getOperator = load;
