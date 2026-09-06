import { existsSync } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import type { PresignedUpload, Storage } from "./types";

export type LocalOptions = { dir: string; publicBase: string; uploadPath?: string };

/**
 * Walks up from the current directory to the workspace root. The web app runs from apps/web
 * and the worker from apps/worker, so a relative storage directory has to be anchored to
 * something they share or they write to two different places.
 */
function workspaceRoot(): string {
  let dir = process.cwd();
  for (let depth = 0; depth < 6; depth += 1) {
    if (existsSync(path.join(dir, "pnpm-workspace.yaml"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

/**
 * Development storage on the filesystem. Presigned PUTs point at a local route that writes
 * the bytes, so the browser upload path is identical to the one used against R2.
 */
export function localStorage(options: LocalOptions): Storage {
  const root = path.isAbsolute(options.dir) ? options.dir : path.resolve(workspaceRoot(), options.dir);
  const uploadPath = options.uploadPath ?? "/api/console/upload-local";

  const resolve = (key: string): string => {
    const full = path.resolve(root, key);
    if (full !== root && !full.startsWith(root + path.sep)) {
      throw new Error(`Key ${key} resolves outside the storage directory`);
    }
    return full;
  };

  return {
    async presignUpload(key, contentType): Promise<PresignedUpload> {
      return {
        url: `${uploadPath}?key=${encodeURIComponent(key)}`,
        method: "PUT",
        headers: { "Content-Type": contentType },
        key,
        publicUrl: this.publicUrl(key),
      };
    },

    // Content type is part of the interface but the filesystem has nowhere to record it.
    async put(key, body) {
      const full = resolve(key);
      await mkdir(path.dirname(full), { recursive: true });
      await writeFile(full, body);
    },

    async get(key) {
      try {
        return new Uint8Array(await readFile(resolve(key)));
      } catch {
        return null;
      }
    },

    async exists(key) {
      try {
        await stat(resolve(key));
        return true;
      } catch {
        return false;
      }
    },

    publicUrl(key) {
      return `${options.publicBase.replace(/\/$/, "")}/${key}`;
    },
  };
}
