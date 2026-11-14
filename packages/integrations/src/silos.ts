export type SilosFile = {
  id: string;
  filename: string;
  mime_type: string;
  size: number;
  folder_id: string | null;
  url: string;
  created_at: string;
};

type SilosEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

function silosConfig() {
  const baseUrl = process.env.SILOS_API_URL;
  const apiKey = process.env.SILOS_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "Silos is not configured. Set SILOS_API_URL and SILOS_API_KEY.",
    );
  }

  return { baseUrl: baseUrl.replace(/\/$/, ""), apiKey };
}

async function silosRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const { baseUrl, apiKey } = silosConfig();

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  let payload: SilosEnvelope<T> | null = null;
  try {
    payload = (await response.json()) as SilosEnvelope<T>;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.message || `Silos request failed (${response.status}).`,
    );
  }

  return payload.data;
}

export function isSilosConfigured() {
  return Boolean(process.env.SILOS_API_URL && process.env.SILOS_API_KEY);
}

/** The multipart endpoint behind /api/v1/upload refuses anything above 4 MB. */
const FORM_UPLOAD_LIMIT = 4_000_000;

type DirectUpload = {
  file_id: string;
  mode: "single" | "multipart";
  upload?: {
    url: string;
    method?: string;
    headers?: Record<string, string>;
  };
  multipart?: {
    part_size: number;
    part_count: number;
    parts: Array<{ n?: number; part_number?: number; url: string }>;
  };
};

/**
 * Upload one file to the project the API key belongs to.
 *
 * Small files go through the classic multipart form. Anything past the form
 * limit takes the presigned path instead, so the bytes go straight to storage
 * and the size limit no longer applies.
 */
export async function uploadToSilos(
  file: Blob,
  options: { filename: string; folderId?: string | null },
): Promise<SilosFile> {
  if (file.size > FORM_UPLOAD_LIMIT) return uploadDirect(file, options);
  return uploadForm(file, options);
}

async function uploadForm(
  file: Blob,
  options: { filename: string; folderId?: string | null },
): Promise<SilosFile> {
  const { baseUrl, apiKey } = silosConfig();
  const form = new FormData();

  form.append("file", file, options.filename);
  if (options.folderId) {
    form.append("folder_id", options.folderId);
  }

  const response = await fetch(`${baseUrl}/api/v1/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | SilosEnvelope<SilosFile>
    | null;

  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.message || `Silos upload failed (${response.status}).`,
    );
  }

  return payload.data;
}

export type SilosUploadTarget = {
  fileId: string;
  mode: "single" | "multipart";
  upload: { url: string; method: string; headers: Record<string, string> } | null;
  partSize: number;
  parts: Array<{ n: number; url: string }>;
};

/**
 * Reserves a pending upload and hands back where the bytes should go.
 *
 * The browser can PUT to the returned URL itself, which keeps large files away
 * from the app server entirely — serverless platforms cap request bodies well
 * below what a photo or a track can weigh.
 */
export async function startSilosUpload(input: {
  filename: string;
  mimeType: string;
  size: number;
  folderId?: string | null;
}): Promise<SilosUploadTarget> {
  const started = await silosRequest<DirectUpload>("/api/v1/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: input.filename,
      mime_type: input.mimeType || "application/octet-stream",
      size: input.size,
      ...(input.folderId ? { folder_id: input.folderId } : {}),
    }),
  });

  return {
    fileId: started.file_id,
    mode: started.mode,
    upload: started.upload
      ? {
        url: started.upload.url,
        method: started.upload.method ?? "PUT",
        headers: started.upload.headers ?? {},
      }
      : null,
    partSize: started.multipart?.part_size ?? 0,
    parts: (started.multipart?.parts ?? []).map((part, index) => ({
      n: part.n ?? part.part_number ?? index + 1,
      url: part.url,
    })),
  };
}

/** Verifies the stored object and flips it to ACTIVE. */
export async function completeSilosUpload(
  fileId: string,
  parts?: Array<{ n: number; etag: string }>,
): Promise<SilosFile> {
  return silosRequest<SilosFile>(
    `/api/v1/uploads/${encodeURIComponent(fileId)}/complete`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parts ? { parts } : {}),
    },
  );
}

/** Presigned upload: initiate, PUT the bytes, then let Silos verify the object. */
async function uploadDirect(
  file: Blob,
  options: { filename: string; folderId?: string | null },
): Promise<SilosFile> {
  const buffer = new Uint8Array(await file.arrayBuffer());
  const target = await startSilosUpload({
    filename: options.filename,
    mimeType: file.type,
    size: buffer.byteLength,
    folderId: options.folderId,
  });

  let parts: Array<{ n: number; etag: string }> | undefined;

  if (target.mode === "multipart" && target.parts.length > 0) {
    parts = [];

    for (const part of target.parts) {
      const slice = buffer.slice(
        (part.n - 1) * target.partSize,
        part.n * target.partSize,
      );
      const response = await fetch(part.url, { method: "PUT", body: slice });
      if (!response.ok) {
        throw new Error(`Silos part ${part.n} failed (${response.status}).`);
      }
      parts.push({ n: part.n, etag: response.headers.get("etag") ?? "" });
    }
  } else if (target.upload) {
    const response = await fetch(target.upload.url, {
      method: target.upload.method,
      headers: target.upload.headers,
      body: buffer,
    });
    if (!response.ok) {
      throw new Error(`Silos upload failed (${response.status}).`);
    }
  } else {
    throw new Error("Silos did not return an upload target.");
  }

  return completeSilosUpload(target.fileId, parts);
}

export async function deleteFromSilos(fileId: string): Promise<void> {
  await silosRequest<null>(`/api/v1/files/${encodeURIComponent(fileId)}`, {
    method: "DELETE",
  });
}

export async function listSilosFiles(params?: {
  folderId?: string;
  search?: string;
}): Promise<SilosFile[]> {
  const query = new URLSearchParams();
  if (params?.folderId) query.set("folder_id", params.folderId);
  if (params?.search) query.set("search", params.search);

  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  return silosRequest<SilosFile[]>(`/api/v1/files${suffix}`);
}
