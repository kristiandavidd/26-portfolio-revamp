"use server";

import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import {
  applyOrder,
  isEntity,
  orderedIds,
  setEntityStatus,
} from "@/lib/entities";
import { currentPath, errorMessage, fail, finish, text } from "@/lib/forms";

/** Swap a row with its neighbour. One pair of arrows serves every table. */
export async function moveItem(formData: FormData) {
  await requireSession();

  const entity = text(formData, "entity");
  const id = text(formData, "id");
  const direction = text(formData, "direction");
  const scope = text(formData, "scope");
  const path = currentPath(formData);

  if (!isEntity(entity)) {
    return fail(formData, "That list could not be found.");
  }

  const ids = await orderedIds(entity, scope);
  const index = ids.indexOf(id);
  const target = direction === "up" ? index - 1 : index + 1;

  if (index === -1 || target < 0 || target >= ids.length) {
    redirect(path);
  }

  [ids[index], ids[target]] = [ids[target], ids[index]];
  await applyOrder(entity, ids);

  await finish(formData, "Order updated.");
}

/** Active / inactive is its own control, so saving never changes visibility. */
export async function setStatus(formData: FormData) {
  await requireSession();

  const entity = text(formData, "entity");
  const id = text(formData, "id");
  const next = text(formData, "status") === "1" ? 1 : 0;

  if (!isEntity(entity)) {
    return fail(formData, "That list could not be found.");
  }

  try {
    await setEntityStatus(entity, id, next);
  } catch (error) {
    return fail(formData, errorMessage(error));
  }

  await finish(formData, next === 1 ? "Marked active." : "Marked inactive.");
}
