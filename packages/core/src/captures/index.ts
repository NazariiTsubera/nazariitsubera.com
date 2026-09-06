import { type Capture, prisma } from "../db";
import { siteRepository } from "../sites/site.repository";
import { storage, uploadKey } from "../storage";
import type { PresignedUpload } from "../storage";

export type StartCaptureInput = {
  vendorId: string;
  contentType: string;
  sha256: string;
  bytes: number;
  durationSec?: number | null;
};

export const MAX_CAPTURE_BYTES = 60 * 1024 * 1024;

export const captureService = {
  /** Same content addressing as photos: re-uploading identical audio reuses the row. */
  async startUpload(input: StartCaptureInput): Promise<{ capture: Capture; upload: PresignedUpload }> {
    if (input.bytes > MAX_CAPTURE_BYTES) throw new Error(`Recording is larger than ${MAX_CAPTURE_BYTES} bytes`);
    const key = uploadKey(input.vendorId, input.sha256, input.contentType);
    const store = storage();

    const existing = await prisma.capture.findUnique({
      where: { vendorId_audioSha256: { vendorId: input.vendorId, audioSha256: input.sha256 } },
    });
    if (existing) {
      return { capture: existing, upload: await store.presignUpload(key, input.contentType, input.bytes) };
    }

    const capture = await prisma.capture.create({
      data: {
        vendorId: input.vendorId,
        audioKey: key,
        audioMime: input.contentType,
        audioBytes: input.bytes,
        audioSha256: input.sha256,
        durationSec: input.durationSec ?? null,
        transcriptStatus: "pending",
      },
    });
    await siteRepository.recordEvent(input.vendorId, "capture_uploaded", { captureId: capture.id });
    return { capture, upload: await store.presignUpload(key, input.contentType, input.bytes) };
  },

  /** The most recent capture is the one generation uses. */
  latest: (vendorId: string) =>
    prisma.capture.findFirst({ where: { vendorId }, orderBy: { createdAt: "desc" } }),

  list: (vendorId: string) => prisma.capture.findMany({ where: { vendorId }, orderBy: { createdAt: "desc" } }),

  setPrompt: (id: string, operatorPrompt: string | null) =>
    prisma.capture.update({ where: { id }, data: { operatorPrompt } }),

  setTranscript: (id: string, transcript: string) =>
    prisma.capture.update({ where: { id }, data: { transcript, transcriptStatus: "done" } }),

  markTranscriptFailed: (id: string) =>
    prisma.capture.update({ where: { id }, data: { transcriptStatus: "failed" } }),
};
