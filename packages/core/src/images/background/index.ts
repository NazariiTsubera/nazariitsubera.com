import { hostedRemoveBackground } from "./hosted";
import { localRemoveBackground } from "./local";

/**
 * Product cutouts. The hosted provider is a background-removal model; the local fallback keys
 * out a near-uniform border colour, which is exactly the foam-board case the field playbook
 * describes, so local runs still produce usable cards.
 *
 * Provider settings are read straight from process.env rather than the validated env schema:
 * they are optional, and image work must stay usable without a full application environment.
 */
export async function removeBackground(image: Uint8Array): Promise<Uint8Array> {
  const endpoint = process.env.BG_REMOVAL_URL;
  if (process.env.PROVIDERS_MODE === "real" && endpoint) {
    return hostedRemoveBackground(image, endpoint, process.env.BG_REMOVAL_KEY ?? "");
  }
  return localRemoveBackground(image);
}
