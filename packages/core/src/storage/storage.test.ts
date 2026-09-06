import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ALLOWED_UPLOAD_TYPES, extensionFor, localStorage, uploadKey } from "./index";

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(path.join(tmpdir(), "nt-storage-"));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

describe("uploadKey", () => {
  it("is content addressed and carries the right extension", () => {
    expect(uploadKey("v1", "abc123", "image/jpeg")).toBe("uploads/v1/abc123.jpg");
    expect(uploadKey("v1", "abc123", "audio/webm")).toBe("uploads/v1/abc123.webm");
  });

  it("rejects a content type that is not allowed", () => {
    expect(() => uploadKey("v1", "abc", "application/x-msdownload")).toThrow(/not allowed/i);
    expect(extensionFor("image/png")).toBe("png");
    expect(ALLOWED_UPLOAD_TYPES["image/heic"]).toBe("heic");
  });
});

describe("local storage", () => {
  it("round trips a put and a get, and reports existence", async () => {
    const store = localStorage({ dir, publicBase: "/media" });
    expect(await store.exists("uploads/v1/a.jpg")).toBe(false);

    await store.put("uploads/v1/a.jpg", new TextEncoder().encode("hello"), "image/jpeg");
    expect(await store.exists("uploads/v1/a.jpg")).toBe(true);
    expect(new TextDecoder().decode((await store.get("uploads/v1/a.jpg"))!)).toBe("hello");
    expect(await store.get("uploads/v1/missing.jpg")).toBeNull();
    expect(store.publicUrl("uploads/v1/a.jpg")).toBe("/media/uploads/v1/a.jpg");
  });

  it("presigns a PUT that names the key and the content type", async () => {
    const store = localStorage({ dir, publicBase: "/media" });
    const signed = await store.presignUpload("uploads/v1/a.jpg", "image/jpeg", 10_000_000);
    expect(signed.method).toBe("PUT");
    expect(signed.key).toBe("uploads/v1/a.jpg");
    expect(signed.url).toContain(encodeURIComponent("uploads/v1/a.jpg"));
    expect(signed.headers["Content-Type"]).toBe("image/jpeg");
  });

  it("refuses to escape its directory", async () => {
    const store = localStorage({ dir, publicBase: "/media" });
    await expect(store.put("../escape.txt", new Uint8Array([1]), "text/plain")).rejects.toThrow(/outside/i);
  });
});
