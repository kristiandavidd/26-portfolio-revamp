"use server";

import { prisma } from "@repo/db";
import { requireSession } from "@/lib/auth";
import { releaseReplacedAssets, resolveAssetField } from "@/lib/assets";
import { archiveEntity, nextSortOrder } from "@/lib/entities";
import {
  checkbox,
  errorMessage,
  fail,
  finish,
  text,
} from "@/lib/forms";

// ---------------------------------------------------------------------------
// Landing
// ---------------------------------------------------------------------------

export async function savePersonalProfile(formData: FormData) {
  await requireSession();

  const name = text(formData, "name");

  if (!name) {
    return fail(formData, "The landing needs a name.");
  }

  const before = await prisma.personalProfile.findUnique({
    where: { id: 1 },
    select: { portraitAssetId: true, heroAssetId: true },
  });

  let keptAsset: string | null = null;
  let keptHero: string | null = null;

  try {
    const data = {
      name,
      headline: text(formData, "headline"),
      intro: text(formData, "intro"),
      location: text(formData, "location"),
      email: text(formData, "email"),
      portraitAssetId: await resolveAssetField(
        formData,
        "portraitAssetId",
        "personal",
      ),
      heroAssetId: await resolveAssetField(
        formData,
        "heroAssetId",
        "personal",
      ),
    };

    await prisma.personalProfile.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });

    keptAsset = data.portraitAssetId;
    keptHero = data.heroAssetId;
  } catch (error) {
    return fail(formData, errorMessage(error));
  }

  if (before) {
    await releaseReplacedAssets(
      [before.portraitAssetId, before.heroAssetId],
      [keptAsset, keptHero],
    );
  }

  await finish(formData, "Personal landing saved.");
}

// ---------------------------------------------------------------------------
// Story: chapter -> subchapter -> paragraph
// ---------------------------------------------------------------------------

export async function saveChapter(formData: FormData) {
  await requireSession();

  const id = text(formData, "id");
  const year = text(formData, "year");
  const title = text(formData, "title");

  if (!year) {
    return fail(formData, "A chapter needs a year.");
  }

  const data = { year, title };

  try {
    if (id) {
      await prisma.personalChapter.update({ where: { id }, data });
    } else {
      await prisma.personalChapter.create({
        data: {
          ...data,
          status: 1,
          sortOrder: await nextSortOrder("chapter"),
        },
      });
    }
  } catch (error) {
    return fail(formData, errorMessage(error));
  }

  await finish(formData, id ? "Chapter updated." : "Chapter created.");
}

export async function deleteChapter(formData: FormData) {
  await requireSession();

  try {
    await archiveEntity("chapter", text(formData, "id"));
  } catch (error) {
    return fail(formData, errorMessage(error));
  }

  await finish(formData, "Chapter deleted.");
}

export async function saveSubchapter(formData: FormData) {
  await requireSession();

  const id = text(formData, "id");
  const chapterId = text(formData, "chapterId");
  const title = text(formData, "title");

  if (!chapterId || !title) {
    return fail(formData, "A subchapter needs a chapter and a title.");
  }

  const data = { title };

  try {
    if (id) {
      await prisma.personalSubchapter.update({ where: { id }, data });
    } else {
      await prisma.personalSubchapter.create({
        data: {
          ...data,
          chapterId,
          status: 1,
          sortOrder: await nextSortOrder("subchapter", chapterId),
        },
      });
    }
  } catch (error) {
    return fail(formData, errorMessage(error));
  }

  await finish(formData, id ? "Subchapter updated." : "Subchapter created.");
}

export async function deleteSubchapter(formData: FormData) {
  await requireSession();

  try {
    await archiveEntity("subchapter", text(formData, "id"));
  } catch (error) {
    return fail(formData, errorMessage(error));
  }

  await finish(formData, "Subchapter deleted.");
}

export async function saveParagraph(formData: FormData) {
  await requireSession();

  const id = text(formData, "id");
  const subchapterId = text(formData, "subchapterId");
  const body = text(formData, "body");

  if (!subchapterId || !body) {
    return fail(formData, "A paragraph needs a subchapter and text.");
  }

  try {
    if (id) {
      await prisma.personalParagraph.update({
        where: { id },
        data: { body },
      });
    } else {
      await prisma.personalParagraph.create({
        data: {
          subchapterId,
          body,
          sortOrder: await nextSortOrder("paragraph", subchapterId),
        },
      });
    }
  } catch (error) {
    return fail(formData, errorMessage(error));
  }

  await finish(formData, id ? "Paragraph updated." : "Paragraph added.");
}

export async function deleteParagraph(formData: FormData) {
  await requireSession();

  try {
    await archiveEntity("paragraph", text(formData, "id"));
  } catch (error) {
    return fail(formData, errorMessage(error));
  }

  await finish(formData, "Paragraph deleted.");
}

// ---------------------------------------------------------------------------
// Places
// ---------------------------------------------------------------------------

export async function savePersonalPlace(formData: FormData) {
  await requireSession();

  const id = text(formData, "id");
  const name = text(formData, "name");

  if (!name) {
    return fail(formData, "A place needs a name.");
  }

  const before = id
    ? await prisma.personalPlace.findUnique({
      where: { id },
      select: { imageAssetId: true },
    })
    : null;

  let keptAsset: string | null = null;

  try {
    const data = {
      name,
      region: text(formData, "region"),
      year: text(formData, "year"),
      note: text(formData, "note"),
      mapsUrl: text(formData, "mapsUrl") || null,
      imageAssetId: await resolveAssetField(
        formData,
        "imageAssetId",
        "personal/places",
      ),
    };

    if (id) {
      await prisma.personalPlace.update({ where: { id }, data });
    } else {
      await prisma.personalPlace.create({
        data: {
          ...data,
          status: 1,
          sortOrder: await nextSortOrder("place"),
        },
      });
    }

    keptAsset = data.imageAssetId;
  } catch (error) {
    return fail(formData, errorMessage(error));
  }

  if (before) {
    await releaseReplacedAssets([before.imageAssetId], [keptAsset]);
  }

  await finish(formData, id ? "Place updated." : "Place added.");
}

export async function deletePersonalPlace(formData: FormData) {
  await requireSession();

  try {
    await archiveEntity("place", text(formData, "id"));
  } catch (error) {
    return fail(formData, errorMessage(error));
  }

  await finish(formData, "Place deleted.");
}

// ---------------------------------------------------------------------------
// Gallery
// ---------------------------------------------------------------------------

export async function savePersonalGalleryItem(formData: FormData) {
  await requireSession();

  const id = text(formData, "id");
  const title = text(formData, "title");

  const before = id
    ? await prisma.personalGalleryItem.findUnique({
      where: { id },
      select: { imageAssetId: true },
    })
    : null;

  let keptAsset: string | null = null;

  try {
    const data = {
      title,
      year: text(formData, "year"),
      note: text(formData, "note"),
      imageAssetId: await resolveAssetField(
        formData,
        "imageAssetId",
        "personal/gallery",
      ),
    };

    if (id) {
      await prisma.personalGalleryItem.update({ where: { id }, data });
    } else {
      await prisma.personalGalleryItem.create({
        data: {
          ...data,
          status: 1,
          sortOrder: await nextSortOrder("gallery"),
        },
      });
    }

    keptAsset = data.imageAssetId;
  } catch (error) {
    return fail(formData, errorMessage(error));
  }

  if (before) {
    await releaseReplacedAssets([before.imageAssetId], [keptAsset]);
  }

  await finish(
    formData,
    id ? "Gallery item updated." : "Gallery item added.",
  );
}

export async function deletePersonalGalleryItem(formData: FormData) {
  await requireSession();

  try {
    await archiveEntity("gallery", text(formData, "id"));
  } catch (error) {
    return fail(formData, errorMessage(error));
  }

  await finish(formData, "Gallery item deleted.");
}

// ---------------------------------------------------------------------------
// Wishlist
// ---------------------------------------------------------------------------

export async function savePersonalWishlistItem(formData: FormData) {
  await requireSession();

  const id = text(formData, "id");
  const title = text(formData, "title");

  if (!title) {
    return fail(formData, "A wishlist item needs a title.");
  }

  const before = id
    ? await prisma.personalWishlistItem.findUnique({
      where: { id },
      select: { imageAssetId: true },
    })
    : null;

  let keptAsset: string | null = null;

  try {
    const data = {
      title,
      note: text(formData, "note"),
      imageAssetId: await resolveAssetField(
        formData,
        "imageAssetId",
        "personal/wishlist",
      ),
      done: checkbox(formData, "done"),
    };

    if (id) {
      await prisma.personalWishlistItem.update({ where: { id }, data });
    } else {
      await prisma.personalWishlistItem.create({
        data: {
          ...data,
          status: 1,
          sortOrder: await nextSortOrder("wishlist"),
        },
      });
    }

    keptAsset = data.imageAssetId;
  } catch (error) {
    return fail(formData, errorMessage(error));
  }

  if (before) {
    await releaseReplacedAssets([before.imageAssetId], [keptAsset]);
  }

  await finish(formData, id ? "Wishlist updated." : "Wishlist item added.");
}

export async function deletePersonalWishlistItem(formData: FormData) {
  await requireSession();

  try {
    await archiveEntity("wishlist", text(formData, "id"));
  } catch (error) {
    return fail(formData, errorMessage(error));
  }

  await finish(formData, "Wishlist item deleted.");
}

export async function toggleWishlistItem(formData: FormData) {
  await requireSession();
  const id = text(formData, "id");

  try {
    const item = await prisma.personalWishlistItem.findUnique({
      where: { id },
      select: { done: true, deletedAt: true },
    });

    if (!item || item.deletedAt) {
      return fail(formData, "That wishlist item no longer exists.");
    }

    await prisma.personalWishlistItem.update({
      where: { id },
      data: { done: !item.done },
    });
  } catch (error) {
    return fail(formData, errorMessage(error));
  }

  await finish(formData, "Wishlist updated.");
}
