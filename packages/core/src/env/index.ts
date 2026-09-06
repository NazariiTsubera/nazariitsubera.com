import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  SITE_ROOT_DOMAIN: z.string().min(1).default("nazariitsubera.com"),
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
  OPERATOR_NAME: z.string().min(1).default("Nazarii Tsubera"),
  OPERATOR_PHONE: z.string().regex(/^\+[1-9]\d{6,14}$/).default("+10000000000"),
  PREVIEW_DAYS: z.coerce.number().int().positive().default(7),

  // "real" uses cloud providers; anything else uses the local fakes, so the console
  // runs with no credentials. Production must set it explicitly.
  PROVIDERS_MODE: z.enum(["real", "fake"]).default("fake"),
  STORAGE_DIR: z.string().min(1).default(".storage"),
  ASSETS_PUBLIC_URL: z.string().min(1).default("/media"),
  R2_ACCOUNT_ID: z.string().default(""),
  R2_ACCESS_KEY_ID: z.string().default(""),
  R2_SECRET_ACCESS_KEY: z.string().default(""),
  R2_BUCKET: z.string().default(""),
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

/** Validated environment. Parsed once; call resetEnvCache() in tests that change process.env. */
export function env(): Env {
  cached ??= schema.parse(process.env);
  return cached;
}

export function resetEnvCache(): void {
  cached = null;
}

/** Fail fast in production, warn elsewhere so tests and local dev run with a partial env. */
export function assertBootEnv(): void {
  const result = schema.safeParse(process.env);
  if (result.success) return;
  const missing = result.error.issues.map((i) => i.path.join(".")).join(", ");
  const message = `Environment is incomplete: ${missing}`;
  if (process.env.NODE_ENV === "production") throw new Error(message);
  console.warn(message);
}
