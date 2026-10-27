export type EchoSendInput = {
  to: string;
  subject: string;
  html: string;
  from?: string;
  templateName?: string;
  variables?: Record<string, string>;
};

type EchoEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

function echoConfig() {
  const baseUrl = process.env.ECHO_API_URL;
  const apiKey = process.env.ECHO_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error("Echo is not configured. Set ECHO_API_URL and ECHO_API_KEY.");
  }

  return { baseUrl: baseUrl.replace(/\/$/, ""), apiKey };
}

export function isEchoConfigured() {
  return Boolean(process.env.ECHO_API_URL && process.env.ECHO_API_KEY);
}

/** Send a transactional email through Echo, raw HTML or a stored template. */
export async function sendEmail(input: EchoSendInput): Promise<unknown> {
  const { baseUrl, apiKey } = echoConfig();

  const response = await fetch(`${baseUrl}/api/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | EchoEnvelope<unknown>
    | null;

  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.message || `Echo request failed (${response.status}).`,
    );
  }

  return payload.data;
}
