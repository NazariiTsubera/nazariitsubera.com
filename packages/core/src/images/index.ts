import sharp from "sharp";

export { removeBackground } from "./background";

export type Dimensions = { width: number; height: number };
export type Normalized = { data: Uint8Array; width: number; height: number };

export const VARIANT_WIDTHS = [480, 960, 1440] as const;

/** Aspect ratios the pipeline crops to, by role. */
const ASPECTS = { "16:9": 16 / 9, "3:2": 3 / 2, "4:5": 4 / 5, "1:1": 1 } as const;
export type Aspect = keyof typeof ASPECTS;

/**
 * Applies EXIF orientation, then strips every scrap of metadata including GPS, so market
 * coordinates never ship inside a vendor's website images. Corrections stay conservative:
 * over-processing looks worse than under-processing.
 */
export async function normalize(input: Uint8Array): Promise<Normalized> {
  const pipeline = sharp(input, { failOn: "none" })
    .rotate() // applies the EXIF orientation tag, then drops it
    .normalise({ lower: 1, upper: 99 })
    .modulate({ saturation: 1.04 });

  const { data, info } = await pipeline
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });

  return { data: new Uint8Array(data), width: info.width, height: info.height };
}

/** True when the buffer carries no EXIF, ICC, IPTC, or XMP block. */
export async function hasMetadata(input: Uint8Array): Promise<boolean> {
  const meta = await sharp(input).metadata();
  return Boolean(meta.exif ?? meta.icc ?? meta.iptc ?? meta.xmp);
}

export async function dimensions(input: Uint8Array): Promise<Dimensions> {
  const meta = await sharp(input).metadata();
  return { width: meta.width ?? 0, height: meta.height ?? 0 };
}

/** Centre crop to an aspect ratio without upscaling. Used for scenes and portraits. */
export async function crop(input: Uint8Array, aspect: Aspect): Promise<Uint8Array> {
  const { width, height } = await dimensions(input);
  const target = ASPECTS[aspect];
  const [w, h] = width / height > target ? [Math.round(height * target), height] : [width, Math.round(width / target)];
  const data = await sharp(input).extract({
    left: Math.round((width - w) / 2),
    top: Math.round((height - h) / 2),
    width: w,
    height: h,
  }).toBuffer();
  return new Uint8Array(data);
}

const MARGIN = 0.08;

/**
 * The single largest quality lever: eight cluttered snapshots become eight cards that read as
 * one shoot. Trim to the subject, pad to a square with a consistent margin, drop it on the
 * theme ground, and add the same soft contact shadow every time.
 */
export async function productCard(cutout: Uint8Array, groundHex: string, size = 1440): Promise<Uint8Array> {
  const trimmed = await sharp(cutout).trim({ threshold: 1 }).png().toBuffer();
  const inner = Math.round(size * (1 - MARGIN * 2));
  const subject = await sharp(trimmed)
    .resize(inner, inner, { fit: "inside", withoutEnlargement: false, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const { width, height } = await dimensions(new Uint8Array(subject));

  // A blurred, squashed silhouette under the subject reads as contact with the surface.
  const shadowHeight = Math.max(6, Math.round(height * 0.06));
  const shadow = await sharp({
    create: { width: Math.round(width * 0.82), height: shadowHeight, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0.28 } },
  })
    .blur(Math.max(4, shadowHeight / 2))
    .png()
    .toBuffer();

  const left = Math.round((size - width) / 2);
  const top = Math.round((size - height) / 2);
  const data = await sharp({ create: { width: size, height: size, channels: 4, background: groundHex } })
    .composite([
      { input: shadow, left: Math.round((size - Math.round(width * 0.82)) / 2), top: Math.min(size - shadowHeight, top + height - Math.round(shadowHeight / 2)) },
      { input: subject, left, top },
    ])
    .webp({ quality: 88 })
    .toBuffer();
  return new Uint8Array(data);
}

/** WebP at each width, never upscaling past the source. */
export async function variants(
  input: Uint8Array,
  widths: readonly number[] = VARIANT_WIDTHS,
): Promise<Record<string, Uint8Array>> {
  const out: Record<string, Uint8Array> = {};
  for (const width of widths) {
    const data = await sharp(input).resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
    out[`w${width}`] = new Uint8Array(data);
  }
  return out;
}
