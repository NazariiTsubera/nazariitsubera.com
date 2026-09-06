export class UnauthorizedError extends Error {
  constructor() {
    super("Operator session required");
    this.name = "UnauthorizedError";
  }
}

export type OperatorSession = { user: { id: string; email: string } };

/**
 * Narrow a maybe-session into a definite one. Kept separate from the Better Auth instance
 * so route handlers and tests can supply their own loader.
 */
export async function operatorFrom(
  load: () => Promise<OperatorSession | null>,
): Promise<OperatorSession> {
  const session = await load();
  if (!session?.user) throw new UnauthorizedError();
  return session;
}
