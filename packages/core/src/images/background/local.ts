import sharp from "sharp";

const TOLERANCE = 42; // how far a pixel may drift from the border colour and still be background

/** Squared RGB distance; avoids a sqrt in the inner loop. */
function distance(data: Uint8Array, i: number, r: number, g: number, b: number): number {
  const dr = data[i] - r;
  const dg = data[i + 1] - g;
  const db = data[i + 2] - b;
  return dr * dr + dg * dg + db * db;
}

/**
 * Flood fill inward from the edges, clearing pixels close to the border colour. Only pixels
 * connected to an edge are removed, so a white highlight inside the product survives.
 */
export async function localRemoveBackground(image: Uint8Array): Promise<Uint8Array> {
  const { data, info } = await sharp(image).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const pixels = new Uint8Array(data);
  const { width, height, channels } = info;

  // The border colour is the average of the four corners.
  const corners = [0, (width - 1) * channels, (height - 1) * width * channels, (height * width - 1) * channels];
  let r = 0;
  let g = 0;
  let b = 0;
  for (const c of corners) {
    r += pixels[c];
    g += pixels[c + 1];
    b += pixels[c + 2];
  }
  r /= 4;
  g /= 4;
  b /= 4;

  const threshold = TOLERANCE * TOLERANCE * 3;
  const seen = new Uint8Array(width * height);
  const queue: number[] = [];

  const push = (x: number, y: number): void => {
    const p = y * width + x;
    if (seen[p]) return;
    seen[p] = 1;
    if (distance(pixels, p * channels, r, g, b) <= threshold) queue.push(p);
  };

  for (let x = 0; x < width; x += 1) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    push(0, y);
    push(width - 1, y);
  }

  while (queue.length > 0) {
    const p = queue.pop()!;
    pixels[p * channels + 3] = 0;
    const x = p % width;
    const y = (p - x) / width;
    if (x > 0) push(x - 1, y);
    if (x < width - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < height - 1) push(x, y + 1);
  }

  const out = await sharp(pixels, { raw: { width, height, channels } }).png().toBuffer();
  return new Uint8Array(out);
}
