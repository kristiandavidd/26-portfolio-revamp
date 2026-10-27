import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { setFlash } from "@/lib/flash";

export function text(formData: FormData, key: string, fallback = "") {
  return String(formData.get(key) ?? fallback).trim();
}

export function nullableText(formData: FormData, key: string) {
  const value = text(formData, key);
  return value || null;
}

export function integer(formData: FormData, key: string, fallback = 0) {
  const value = Number.parseInt(text(formData, key), 10);
  return Number.isFinite(value) ? value : fallback;
}

export function checkbox(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === "on" || value === "1" || value === "true";
}

export function lines(formData: FormData, key: string) {
  return text(formData, key)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function commaList(formData: FormData, key: string) {
  return text(formData, key)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function currentPath(formData: FormData) {
  const path = text(formData, "_path", "/");
  return path.startsWith("/") ? path : "/";
}

/** Go back to the form with a clean URL and a success toast waiting there. */
export async function finish(
  formData: FormData,
  message: string,
): Promise<never> {
  const path = currentPath(formData);
  await setFlash(message, "success");
  revalidatePath(path);
  redirect(path);
}

/** Go back to the form with a clean URL and an error toast waiting there. */
export async function fail(
  formData: FormData,
  message: string,
): Promise<never> {
  const path = currentPath(formData);
  await setFlash(message, "error");
  redirect(path);
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}
