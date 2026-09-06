"use client";

/** Every console mutation goes through here so error handling is written once. */
export async function post<T = unknown>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "Request failed");
  return data as T;
}

/** Content addressing: the browser hashes the file so re-uploads are free and idempotent. */
export async function sha256(file: Blob): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export type PresignedUpload = { url: string; method: "PUT"; headers: Record<string, string> };

export async function uploadFile(
  vendorId: string,
  kind: "asset" | "capture",
  file: Blob,
  contentType: string,
  extra: Record<string, unknown> = {},
): Promise<{ id: string }> {
  const hash = await sha256(file);
  const { id, upload } = await post<{ id: string; upload: PresignedUpload }>("/api/console/uploads", {
    vendorId,
    kind,
    contentType,
    sha256: hash,
    bytes: file.size,
    ...extra,
  });
  const put = await fetch(upload.url, { method: upload.method, headers: upload.headers, body: file });
  if (!put.ok) throw new Error(`Upload failed (${put.status})`);
  return { id };
}
