"use server";

import { prisma } from "@repo/db";
import { requireSession } from "@/lib/auth";
import { releaseReplacedAssets, resolveAssetField } from "@/lib/assets";
import { errorMessage, fail, finish } from "@/lib/forms";

/** General settings: one music track and one favicon per app. */
export async function saveGeneralSettings(formData: FormData) {
  await requireSession();

  const before = await prisma.siteSetting.findUnique({
    where: { id: 1 },
    select: {
      musicAssetId: true,
      portfolioFaviconAssetId: true,
      personalFaviconAssetId: true,
      manageFaviconAssetId: true,
    },
  });

  let next = {
    musicAssetId: null as string | null,
    portfolioFaviconAssetId: null as string | null,
    personalFaviconAssetId: null as string | null,
    manageFaviconAssetId: null as string | null,
  };

  try {
    next = {
      musicAssetId: await resolveAssetField(
        formData,
        "musicAssetId",
        "settings/music",
        "shared",
      ),
      portfolioFaviconAssetId: await resolveAssetField(
        formData,
        "portfolioFaviconAssetId",
        "settings/favicons",
        "shared",
      ),
      personalFaviconAssetId: await resolveAssetField(
        formData,
        "personalFaviconAssetId",
        "settings/favicons",
        "shared",
      ),
      manageFaviconAssetId: await resolveAssetField(
        formData,
        "manageFaviconAssetId",
        "settings/favicons",
        "shared",
      ),
    };

    await prisma.siteSetting.upsert({
      where: { id: 1 },
      update: next,
      create: { id: 1, ...next },
    });
  } catch (error) {
    return fail(formData, errorMessage(error));
  }

  if (before) {
    await releaseReplacedAssets(
      [
        before.musicAssetId,
        before.portfolioFaviconAssetId,
        before.personalFaviconAssetId,
        before.manageFaviconAssetId,
      ],
      [
        next.musicAssetId,
        next.portfolioFaviconAssetId,
        next.personalFaviconAssetId,
        next.manageFaviconAssetId,
      ],
    );
  }

  await finish(formData, "General settings saved.");
}
