import { cookies } from "next/headers";

export type FlashTone = "success" | "error";

export type Flash = {
  message: string;
  tone: FlashTone;
};

const FLASH_COOKIE = "panel_flash";

/**
 * A one-shot message for the next render. Cookies keep the URL clean — the old
 * ?saved=... query string was both ugly and easy to re-share by accident.
 */
export async function setFlash(message: string, tone: FlashTone = "success") {
  const store = await cookies();
  store.set(FLASH_COOKIE, JSON.stringify({ message, tone }), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 30,
  });
}

export async function readFlash(): Promise<Flash | null> {
  const store = await cookies();
  const raw = store.get(FLASH_COOKIE)?.value;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Flash;
    if (!parsed.message) return null;
    return {
      message: parsed.message,
      tone: parsed.tone === "error" ? "error" : "success",
    };
  } catch {
    return null;
  }
}

export async function clearFlashCookie() {
  const store = await cookies();
  store.delete(FLASH_COOKIE);
}
