import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderInputSchema, themeIdSchema } from "../src/contracts";
import { fontFilePath, getTheme } from "../src/themes";
import { renderSite } from "../src/template";

const coreRoot = fileURLToPath(new URL("..", import.meta.url));
const args = process.argv.slice(2);

function opt(name: string, fallback: string): string {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}

const fixtureDir = path.resolve(coreRoot, opt("fixture", "fixtures/demo-vendor"));
const themeArg = opt("theme", "");
const defaultOut = `out/${path.basename(fixtureDir)}${themeArg ? `-${themeArg}` : ""}`;
const outDir = path.resolve(coreRoot, opt("out", defaultOut));

const raw: unknown = JSON.parse(readFileSync(path.join(fixtureDir, "render-input.json"), "utf8"));
const input = renderInputSchema.parse(
  themeArg ? { ...(raw as Record<string, unknown>), themeId: themeIdSchema.parse(themeArg) } : raw,
);

const { html, bytes } = renderSite(input);

mkdirSync(path.join(outDir, "fonts"), { recursive: true });
writeFileSync(path.join(outDir, "index.html"), html);

const theme = getTheme(input.themeId);
for (const font of [theme.fonts.heading, theme.fonts.body]) {
  copyFileSync(fontFilePath(font), path.join(outDir, "fonts", font.file));
}

const PLACEHOLDER_FILL: Record<string, string> = { product: "#D9C9B6", scene: "#B9C6B0", person: "#C9B7C0" };

/** Real photos arrive with the pipeline. Until then, an SVG of the right aspect stands in for any missing image. */
function placeholderSvg(width: number, height: number, label: string, kind: string): string {
  const fill = PLACEHOLDER_FILL[kind] ?? "#CCCCCC";
  const fontSize = Math.round(width / 16);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<rect width="100%" height="100%" fill="${fill}"/>` +
    `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="${fontSize}" fill="#3A342E">${label}</text>` +
    `</svg>\n`
  );
}

let placeholders = 0;
for (const asset of Object.values(input.assets)) {
  for (const [key, rel] of Object.entries(asset.variants)) {
    const src = path.join(fixtureDir, rel);
    const dest = path.join(outDir, rel);
    mkdirSync(path.dirname(dest), { recursive: true });
    if (existsSync(src)) {
      copyFileSync(src, dest);
      continue;
    }
    if (!rel.endsWith(".svg")) {
      throw new Error(`Missing image ${rel} for asset ${asset.id}; only .svg variants get placeholders.`);
    }
    const width = Number(key.slice(1));
    const height = Math.round((width * asset.height) / asset.width);
    writeFileSync(dest, placeholderSvg(width, height, asset.alt || asset.id, asset.kind));
    placeholders += 1;
  }
}

console.log(
  `Rendered "${input.content.businessName}" with theme ${input.themeId} -> ${path.relative(coreRoot, outDir)}/index.html (${bytes} bytes, ${placeholders} placeholder images)`,
);
