"use server";

import { redirect } from "next/navigation";
import {
  clearSessionCookie,
  createSessionToken,
  setSessionCookie,
  verifyCredentials,
} from "@/lib/auth";

export type LoginState = {
  error: string;
};

export async function login(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!verifyCredentials(username, password)) {
    return { error: "Wrong username or password." };
  }

  await setSessionCookie(createSessionToken(username));
  redirect("/");
}

export async function logout() {
  await clearSessionCookie();
  redirect("/login");
}
