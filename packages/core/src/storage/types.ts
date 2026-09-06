export type PresignedUpload = {
  url: string;
  method: "PUT";
  headers: Record<string, string>;
  key: string;
  publicUrl: string;
};

export interface Storage {
  /** A URL the browser can PUT the file to directly, so bytes never pass through the app. */
  presignUpload(key: string, contentType: string, maxBytes: number): Promise<PresignedUpload>;
  put(key: string, body: Uint8Array, contentType: string): Promise<void>;
  get(key: string): Promise<Uint8Array | null>;
  exists(key: string): Promise<boolean>;
  publicUrl(key: string): string;
}

/** Everything the operator can upload from the console. */
export const ALLOWED_UPLOAD_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "audio/webm": "webm",
  "audio/mp4": "m4a",
  "audio/mpeg": "mp3",
  "audio/ogg": "ogg",
};

export function extensionFor(contentType: string): string {
  const ext = ALLOWED_UPLOAD_TYPES[contentType];
  if (!ext) throw new Error(`Content type ${contentType} is not allowed`);
  return ext;
}

/** Content addressed: the same bytes for the same vendor always land on the same key. */
export function uploadKey(vendorId: string, sha256: string, contentType: string): string {
  return `uploads/${vendorId}/${sha256}.${extensionFor(contentType)}`;
}
