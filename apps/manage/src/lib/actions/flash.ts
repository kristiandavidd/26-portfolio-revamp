"use server";

import { clearFlashCookie } from "@/lib/flash";

export async function dismissFlash() {
  await clearFlashCookie();
}
