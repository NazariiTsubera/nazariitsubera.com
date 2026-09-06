import { auth } from "../src/auth";
import { prisma } from "../src/db";

/**
 * Creates or repairs the single operator account. Safe to run repeatedly.
 * Sign-up is disabled in the auth config, so the public API has no createUser and this
 * script goes through the internal adapter instead. It is the only way an account exists.
 */
async function main(): Promise<void> {
  const email = process.env.OPERATOR_EMAIL;
  const password = process.env.OPERATOR_PASSWORD;
  const name = process.env.OPERATOR_NAME ?? "Operator";

  if (!email || !password) throw new Error("Set OPERATOR_EMAIL and OPERATOR_PASSWORD before seeding.");
  if (password.length < 12) throw new Error("OPERATOR_PASSWORD must be at least 12 characters.");

  const ctx = await auth.$context;
  const hash = await ctx.password.hash(password);

  const existing = await ctx.internalAdapter.findUserByEmail(email);
  if (existing) {
    await ctx.internalAdapter.updatePassword(existing.user.id, hash);
    console.log(`Operator ${email} already existed; password reset.`);
    return;
  }

  // createUser takes (user, source); the source records how the account came to exist.
  const user = await ctx.internalAdapter.createUser({ email, name, emailVerified: true }, { method: "email-password" });
  await ctx.internalAdapter.createAccount({
    userId: user.id,
    providerId: "credential",
    accountId: user.id,
    password: hash,
  });
  console.log(`Operator ${email} created.`);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
