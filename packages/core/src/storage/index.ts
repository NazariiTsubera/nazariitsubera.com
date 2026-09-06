import { env } from "../env";
import { localStorage } from "./local";
import { r2Storage } from "./r2";
import type { Storage } from "./types";

export { localStorage } from "./local";
export { r2Storage } from "./r2";
export { ALLOWED_UPLOAD_TYPES, extensionFor, uploadKey } from "./types";
export type { PresignedUpload, Storage } from "./types";

let instance: Storage | null = null;

/** R2 in production, the filesystem everywhere else, so the console runs with no cloud credentials. */
export function storage(): Storage {
  if (instance) return instance;
  const e = env();
  instance =
    e.PROVIDERS_MODE === "real"
      ? r2Storage({
          accountId: e.R2_ACCOUNT_ID,
          accessKeyId: e.R2_ACCESS_KEY_ID,
          secretAccessKey: e.R2_SECRET_ACCESS_KEY,
          bucket: e.R2_BUCKET,
          publicBase: e.ASSETS_PUBLIC_URL,
        })
      : localStorage({ dir: e.STORAGE_DIR, publicBase: e.ASSETS_PUBLIC_URL });
  return instance;
}

export function resetStorage(): void {
  instance = null;
}
