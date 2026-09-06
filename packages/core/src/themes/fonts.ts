import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { FontSpec } from "./types";

/** packages/core/, resolved from this file so it works under tsx, vitest, and Next. */
const coreRoot = fileURLToPath(new URL("../../", import.meta.url));

/** Absolute path of a theme font's woff2 inside core's own node_modules. Direct deps are always linked there by pnpm. */
export function fontFilePath(font: FontSpec): string {
  return path.join(coreRoot, "node_modules", font.package, "files", font.file);
}

export function fontFileExists(font: FontSpec): boolean {
  return existsSync(fontFilePath(font));
}
