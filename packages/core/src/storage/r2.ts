import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import type { PresignedUpload, Storage } from "./types";

export type R2Options = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBase: string;
};

const PRESIGN_TTL_SECONDS = 600;

/** Cloudflare R2 over the S3 API. */
export function r2Storage(options: R2Options): Storage {
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${options.accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: options.accessKeyId, secretAccessKey: options.secretAccessKey },
  });

  return {
    async presignUpload(key, contentType, maxBytes): Promise<PresignedUpload> {
      const url = await getSignedUrl(
        client,
        new PutObjectCommand({ Bucket: options.bucket, Key: key, ContentType: contentType, ContentLength: maxBytes }),
        { expiresIn: PRESIGN_TTL_SECONDS },
      );
      return {
        url,
        method: "PUT",
        headers: { "Content-Type": contentType, "Content-Length": String(maxBytes) },
        key,
        publicUrl: this.publicUrl(key),
      };
    },

    async put(key, body, contentType) {
      await client.send(new PutObjectCommand({ Bucket: options.bucket, Key: key, Body: body, ContentType: contentType }));
    },

    async get(key) {
      try {
        const result = await client.send(new GetObjectCommand({ Bucket: options.bucket, Key: key }));
        return new Uint8Array(await result.Body!.transformToByteArray());
      } catch {
        return null;
      }
    },

    async exists(key) {
      try {
        await client.send(new HeadObjectCommand({ Bucket: options.bucket, Key: key }));
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
