"use server";

import {
  completeSilosUpload,
  deleteFromSilos,
  startSilosUpload,
} from "@repo/integrations";
import { requireSession } from "@/lib/auth";
import { errorMessage } from "@/lib/forms";

type StartedUpload = Awaited<ReturnType<typeof startSilosUpload>>;

/**
 * Uploads happen in two server calls around the browser's own PUT: the bytes
 * never touch the app server, so the platform request limit stops mattering.
 */
export async function beginUpload(input: {
  filename: string;
  mimeType: string;
  size: number;
}): Promise<{ ok: true; target: StartedUpload } | { ok: false; error: string }> {
  await requireSession();

  try {
    return { ok: true, target: await startSilosUpload(input) };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function finishUpload(input: {
  fileId: string;
  parts?: Array<{ n: number; etag: string }>;
}): Promise<
  | {
      ok: true;
      file: {
        fileId: string;
        url: string;
        filename: string;
        mimeType: string;
        size: number;
      };
    }
  | { ok: false; error: string }
> {
  await requireSession();

  try {
    const stored = await completeSilosUpload(input.fileId, input.parts);
    return {
      ok: true,
      file: {
        fileId: stored.id,
        url: stored.url,
        filename: stored.filename,
        mimeType: stored.mime_type,
        size: stored.size,
      },
    };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

/** Throws away an upload the user replaced or cancelled. */
export async function discardUpload(fileId: string) {
  await requireSession();
  await deleteFromSilos(fileId).catch(() => undefined);
}
