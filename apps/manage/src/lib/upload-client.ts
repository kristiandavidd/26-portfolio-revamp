"use client";

import { beginUpload, finishUpload } from "@/lib/actions/upload";

/** What the form carries after a successful upload, before the row is saved. */
export type PendingUpload = {
  fileId: string;
  url: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
};

/**
 * Sends the bytes straight from the browser to storage. Only the small
 * handshake goes through a server action, which is what lets files far past
 * the serverless request limit through.
 */
export async function uploadFile(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<PendingUpload> {
  const started = await beginUpload({
    filename: file.name,
    mimeType: file.type,
    size: file.size,
  });

  if (!started.ok) throw new Error(started.error);
  const target = started.target;

  const parts: Array<{ n: number; etag: string }> = [];

  if (target.mode === "multipart" && target.parts.length > 0) {
    for (const part of target.parts) {
      const slice = file.slice(
        (part.n - 1) * target.partSize,
        part.n * target.partSize,
      );
      const etag = await putBlob(part.url, slice);
      parts.push({ n: part.n, etag: etag ?? "" });
    }
  } else if (target.upload) {
    await putBlob(
      target.upload.url,
      file,
      target.upload.headers,
      target.upload.method,
      onProgress,
    );
  } else {
    throw new Error("Silos did not return an upload target.");
  }

  const done = await finishUpload({
    fileId: target.fileId,
    parts: parts.length > 0 ? parts : undefined,
  });

  if (!done.ok) throw new Error(done.error);

  const size = await imageDimensions(file);

  return {
    ...done.file,
    originalName: file.name,
    width: size?.width ?? null,
    height: size?.height ?? null,
  };
}

function putBlob(
  url: string,
  blob: Blob,
  headers: Record<string, string> = {},
  method = "PUT",
  onProgress?: (percent: number) => void,
): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open(method, url);

    for (const [key, value] of Object.entries(headers)) {
      request.setRequestHeader(key, value);
    }

    request.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        resolve(request.getResponseHeader("ETag"));
        return;
      }
      reject(new Error(`Storage rejected the file (${request.status}).`));
    };

    request.onerror = () => {
      reject(
        new Error(
          "Storage blocked the browser upload (CORS). Allow this origin on the Silos bucket, or choose a file under 4 MB.",
        ),
      );
    };

    request.send(blob);
  });
}

async function imageDimensions(file: File) {
  if (!file.type.startsWith("image/")) return null;

  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    return null;
  }
}
