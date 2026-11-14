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

/** Presigned upload: initiate, PUT the bytes, then let Silos verify the object. */
async function uploadDirect(
  file: Blob,
  options: { filename: string; folderId?: string | null },
): Promise<SilosFile> {
  const buffer = new Uint8Array(await file.arrayBuffer());
  const started = await silosRequest<DirectUpload>("/api/v1/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: options.filename,
      mime_type: file.type || "application/octet-stream",
      size: buffer.byteLength,
      ...(options.folderId ? { folder_id: options.folderId } : {}),
    }),
  });

  let parts: Array<{ n: number; etag: string }> | undefined;

  if (started.mode === "multipart" && started.multipart) {
    const { part_size, parts: targets } = started.multipart;
    parts = [];

    for (const [index, target] of targets.entries()) {
      const n = target.n ?? target.part_number ?? index + 1;
      const slice = buffer.slice((n - 1) * part_size, n * part_size);
      const response = await fetch(target.url, { method: "PUT", body: slice });
      if (!response.ok) {
        throw new Error(`Silos part ${n} failed (${response.status}).`);
      }
      parts.push({ n, etag: response.headers.get("etag") ?? "" });
    }
  } else if (started.upload) {
    const response = await fetch(started.upload.url, {
      method: started.upload.method ?? "PUT",
      headers: started.upload.headers,
      body: buffer,
    });
    if (!response.ok) {
      throw new Error(`Silos upload failed (${response.status}).`);
    }
  } else {
    throw new Error("Silos did not return an upload target.");
  }

  return silosRequest<SilosFile>(
    `/api/v1/uploads/${encodeURIComponent(started.file_id)}/complete`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parts ? { parts } : {}),
    },
  );
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
