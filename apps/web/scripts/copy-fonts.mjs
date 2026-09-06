// Copies every font a theme declares into public/fonts so Next serves them as static assets.
// Runs before dev and build. The files stay out of git; node_modules is the source of truth.
import { copyFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = fileURLToPath(new URL("..", import.meta.url));
const coreRoot = path.join(webRoot, "../../packages/core");
const outDir = path.join(webRoot, "public/fonts");

const themesSource = await readFile(path.join(coreRoot, "src/themes/themes.ts"), "utf8");
const fonts = [...themesSource.matchAll(/package:\s*"([^"]+)",\s*file:\s*"([^"]+)"/g)].map(([, pkg, file]) => ({ pkg, file }));
if (fonts.length === 0) throw new Error("No fonts found in packages/core/src/themes/themes.ts");

await mkdir(outDir, { recursive: true });
const seen = new Set();
for (const { pkg, file } of fonts) {
  if (seen.has(file)) continue;
  seen.add(file);
  await copyFile(path.join(coreRoot, "node_modules", pkg, "files", file), path.join(outDir, file));
}
console.log(`copy-fonts: ${seen.size} files -> public/fonts`);
