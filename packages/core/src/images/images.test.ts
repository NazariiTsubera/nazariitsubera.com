import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { crop, dimensions, hasMetadata, normalize, productCard, removeBackground, variants } from "./index";

/** A photo-like source: a coloured square on a white border, with EXIF attached. */
async function sourcePhoto(width = 800, height = 600): Promise<Uint8Array> {
  const subject = await sharp({
    create: { width: Math.round(width / 2), height: Math.round(height / 2), channels: 3, background: "#B8462B" },
  })
    .png()
    .toBuffer();

  const data = await sharp({ create: { width, height, channels: 3, background: "#ffffff" } })
    .composite([{ input: subject, left: Math.round(width / 4), top: Math.round(height / 4) }])
    .withExifMerge({ IFD0: { Copyright: "test", Software: "camera" } })
    .jpeg()
    .toBuffer();
  return new Uint8Array(data);
}

async function pixel(image: Uint8Array, x: number, y: number): Promise<number[]> {
  const { data, info } = await sharp(image).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const i = (y * info.width + x) * info.channels;
  return [data[i], data[i + 1], data[i + 2], data[i + 3]];
}

describe("normalize", () => {
  it("strips every scrap of metadata, GPS included", async () => {
    const source = await sourcePhoto();
    expect(await hasMetadata(source)).toBe(true);
    expect(await hasMetadata((await normalize(source)).data)).toBe(false);
  });

  it("reports the dimensions of the normalized image", async () => {
    const result = await normalize(await sourcePhoto(800, 600));
    expect([result.width, result.height]).toEqual([800, 600]);
  });

  it("applies EXIF orientation, swapping the axes for a rotated photo", async () => {
    // Orientation 6 means "rotate 90° clockwise on display", so a landscape file is portrait.
    const rotated = await sharp({ create: { width: 800, height: 600, channels: 3, background: "#888888" } })
      .withMetadata({ orientation: 6 })
      .jpeg()
      .toBuffer();
    const result = await normalize(new Uint8Array(rotated));
    expect([result.width, result.height]).toEqual([600, 800]);
  });
});

describe("removeBackground (local key-out)", () => {
  it("clears the uniform border and keeps the subject opaque", async () => {
    const cutout = await removeBackground(await sourcePhoto());
    expect((await pixel(cutout, 2, 2))[3]).toBe(0);
    expect((await pixel(cutout, 400, 300))[3]).toBe(255);
  });

  it("keeps a light region that is not connected to the edge", async () => {
    const inner = await sharp({ create: { width: 40, height: 40, channels: 3, background: "#ffffff" } }).png().toBuffer();
    const source = await sharp({ create: { width: 400, height: 400, channels: 3, background: "#ffffff" } })
      .composite([
        { input: await sharp({ create: { width: 200, height: 200, channels: 3, background: "#2F6B3A" } }).png().toBuffer(), left: 100, top: 100 },
        { input: inner, left: 180, top: 180 },
      ])
      .jpeg()
      .toBuffer();

    const cutout = await removeBackground(new Uint8Array(source));
    expect((await pixel(cutout, 2, 2))[3]).toBe(0);
    expect((await pixel(cutout, 200, 200))[3]).toBe(255);
  });
});

describe("productCard", () => {
  it("is square, sits on the theme ground, and centres the subject", async () => {
    const cutout = await removeBackground(await sourcePhoto());
    const card = await productCard(cutout, "#F3EBDF", 600);

    expect(await dimensions(card)).toEqual({ width: 600, height: 600 });

    // WebP is lossy, so the ground is compared within a tolerance rather than exactly.
    const corner = await pixel(card, 4, 4);
    for (const [channel, expected] of [243, 235, 223].entries()) {
      expect(Math.abs(corner[channel] - expected)).toBeLessThanOrEqual(3);
    }
    const centre = await pixel(card, 300, 300);
    expect(Math.abs(centre[0] - 243) + Math.abs(centre[1] - 235) + Math.abs(centre[2] - 223)).toBeGreaterThan(30);
  });

  it("produces the same geometry for differently shaped sources, so cards read as one shoot", async () => {
    const wide = await productCard(await removeBackground(await sourcePhoto(1200, 400)), "#F3EBDF", 600);
    const tall = await productCard(await removeBackground(await sourcePhoto(400, 1200)), "#F3EBDF", 600);
    expect(await dimensions(wide)).toEqual(await dimensions(tall));
  });
});

describe("crop and variants", () => {
  it("crops to the requested aspect", async () => {
    const source = await sourcePhoto(1000, 1000);
    const wide = await dimensions(await crop(source, "16:9"));
    expect(wide.width / wide.height).toBeCloseTo(16 / 9, 1);

    const portrait = await dimensions(await crop(source, "4:5"));
    expect(portrait.width / portrait.height).toBeCloseTo(4 / 5, 1);
  });

  it("emits webp at each width without upscaling", async () => {
    const result = await variants(await sourcePhoto(1000, 800));
    expect(Object.keys(result)).toEqual(["w480", "w960", "w1440"]);
    expect((await dimensions(result.w480)).width).toBe(480);
    expect((await dimensions(result.w1440)).width).toBe(1000);
    expect((await sharp(result.w960).metadata()).format).toBe("webp");
  });
});
