import { existsSync } from "node:fs";
import path from "node:path";
import createMDX from "@next/mdx";
import type { NextConfig } from "next";

// One .env at the repository root serves every workspace. Next only reads its own directory,
// so load the root file here; Railway sets real variables and has no file.
const rootEnv = path.resolve(process.cwd(), "../../.env");
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

const nextConfig: NextConfig = {
  transpilePackages: ["@nazariitsubera/core"],
  serverExternalPackages: ["@prisma/client", "prisma"],
  async headers() {
    return [
      {
        // Fonts are copied from a pinned package version and never edited in place.
        source: "/fonts/:file*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ];
  },
};

// Work articles are MDX files under content/work, imported by the /work/[slug] route.
const withMDX = createMDX({});

export default withMDX(nextConfig);
