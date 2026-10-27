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

/** Upload one file to the project the API key belongs to. */
export async function uploadToSilos(
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
