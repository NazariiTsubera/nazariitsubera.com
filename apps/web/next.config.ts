import { existsSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

// One .env at the repository root serves every workspace. Next only reads its own directory,
// so load the root file here; Railway sets real variables and has no file.
const rootEnv = path.resolve(process.cwd(), "../../.env");
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

const nextConfig: NextConfig = {
  transpilePackages: ["@nazariitsubera/core"],
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
