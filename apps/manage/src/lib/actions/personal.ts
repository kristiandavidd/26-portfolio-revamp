"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@repo/db";
import { requireSession } from "@/lib/auth";
import {
  releaseAsset,
  releaseReplacedAssets,
  resolveAssetField,
} from "@/lib/assets";
import {
  checkbox,
  currentPath,
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
    select: { portraitAssetId: true },
  });

  let keptAsset: string | null = null;

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
    };

    await prisma.personalProfile.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });

    keptAsset = data.portraitAssetId;
  } catch (error) {
    return fail(formData, errorMessage(error));
  }

  if (before) {
    await releaseReplacedAssets([before.portraitAssetId], [keptAsset]);
  }

  await finish(formData, "Personal landing saved.");
}

// ---------------------------------------------------------------------------
// Story
// ---------------------------------------------------------------------------

export async function savePersonalStory(formData: FormData) {
  await requireSession();

  const id = text(formData, "id");
  const title = text(formData, "title");

  if (!title) {
    return fail(formData, "A story card needs a title.");
  }

  const before = id
    ? await prisma.personalStory.findUnique({
        where: { id },
        select: { imageAssetId: true },
      })
    : null;

  let keptAsset: string | null = null;

  try {
    const data = {
      periodLabel: text(formData, "periodLabel"),
      title,
      body: text(formData, "body"),
      imageAssetId: await resolveAssetField(
        formData,
        "imageAssetId",
        "personal/story",
      ),
      status: checkbox(formData, "status") ? 1 : 0,
    };

    if (id) {
      await prisma.personalStory.update({ where: { id }, data });
    } else {
      const last = await prisma.personalStory.aggregate({
        _max: { sortOrder: true },
      });
      await prisma.personalStory.create({
        data: { ...data, sortOrder: (last._max.sortOrder ?? -1) + 1 },
      });
    }

    keptAsset = data.imageAssetId;
  } catch (error) {
    return fail(formData, errorMessage(error));
  }

  if (before) {
    await releaseReplacedAssets([before.imageAssetId], [keptAsset]);
  }

  await finish(formData, id ? "Story card updated." : "Story card added.");
}

export async function deletePersonalStory(formData: FormData) {
  await requireSession();
  const id = text(formData, "id");

  const before = await prisma.personalStory.findUnique({
    where: { id },
    select: { imageAssetId: true },
  });

  try {
    await prisma.personalStory.delete({ where: { id } });
  } catch (error) {
    return fail(formData, errorMessage(error));
  }

  await releaseAsset(before?.imageAssetId);

  await finish(formData, "Story card deleted.");
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
      status: checkbox(formData, "status") ? 1 : 0,
    };

    if (id) {
      await prisma.personalPlace.update({ where: { id }, data });
    } else {
      const last = await prisma.personalPlace.aggregate({
        _max: { sortOrder: true },
      });
      await prisma.personalPlace.create({
        data: { ...data, sortOrder: (last._max.sortOrder ?? -1) + 1 },
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
  const id = text(formData, "id");

  const before = await prisma.personalPlace.findUnique({
    where: { id },
    select: { imageAssetId: true },
  });

  try {
    await prisma.personalPlace.delete({ where: { id } });
  } catch (error) {
    return fail(formData, errorMessage(error));
  }

  await releaseAsset(before?.imageAssetId);

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
      status: checkbox(formData, "status") ? 1 : 0,
    };

    if (id) {
      await prisma.personalGalleryItem.update({ where: { id }, data });
    } else {
      const last = await prisma.personalGalleryItem.aggregate({
        _max: { sortOrder: true },
      });
      await prisma.personalGalleryItem.create({
        data: { ...data, sortOrder: (last._max.sortOrder ?? -1) + 1 },
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
  const id = text(formData, "id");

  const before = await prisma.personalGalleryItem.findUnique({
    where: { id },
    select: { imageAssetId: true },
  });

  try {
    await prisma.personalGalleryItem.delete({ where: { id } });
  } catch (error) {
    return fail(formData, errorMessage(error));
  }

  await releaseAsset(before?.imageAssetId);

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
      status: checkbox(formData, "status") ? 1 : 0,
    };

    if (id) {
      await prisma.personalWishlistItem.update({ where: { id }, data });
    } else {
      const last = await prisma.personalWishlistItem.aggregate({
        _max: { sortOrder: true },
      });
      await prisma.personalWishlistItem.create({
        data: { ...data, sortOrder: (last._max.sortOrder ?? -1) + 1 },
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
  const id = text(formData, "id");

  const before = await prisma.personalWishlistItem.findUnique({
    where: { id },
    select: { imageAssetId: true },
  });

  try {
    await prisma.personalWishlistItem.delete({ where: { id } });
  } catch (error) {
    return fail(formData, errorMessage(error));
  }

  await releaseAsset(before?.imageAssetId);

  await finish(formData, "Wishlist item deleted.");
}

export async function toggleWishlistItem(formData: FormData) {
  await requireSession();
  const id = text(formData, "id");

  try {
    const item = await prisma.personalWishlistItem.findUnique({
      where: { id },
      select: { done: true },
    });

    if (!item) {
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

// ---------------------------------------------------------------------------
// Reordering
// ---------------------------------------------------------------------------

async function orderedIds(entity: string) {
  switch (entity) {
    case "story":
      return (
        await prisma.personalStory.findMany({
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: { id: true },
        })
      ).map((row) => row.id);
    case "place":
      return (
        await prisma.personalPlace.findMany({
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: { id: true },
        })
      ).map((row) => row.id);
    case "gallery":
      return (
        await prisma.personalGalleryItem.findMany({
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: { id: true },
        })
      ).map((row) => row.id);
    case "wishlist":
      return (
        await prisma.personalWishlistItem.findMany({
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: { id: true },
        })
      ).map((row) => row.id);
    default:
      return [];
  }
}

async function applyOrder(entity: string, ids: string[]) {
  switch (entity) {
    case "story":
      await prisma.$transaction(
        ids.map((id, sortOrder) =>
          prisma.personalStory.update({ where: { id }, data: { sortOrder } }),
        ),
      );
      break;
    case "place":
      await prisma.$transaction(
        ids.map((id, sortOrder) =>
          prisma.personalPlace.update({ where: { id }, data: { sortOrder } }),
        ),
      );
      break;
    case "gallery":
      await prisma.$transaction(
        ids.map((id, sortOrder) =>
          prisma.personalGalleryItem.update({
            where: { id },
            data: { sortOrder },
          }),
        ),
      );
      break;
    case "wishlist":
      await prisma.$transaction(
        ids.map((id, sortOrder) =>
          prisma.personalWishlistItem.update({
            where: { id },
            data: { sortOrder },
          }),
        ),
      );
      break;
  }
}

export async function movePersonalItem(formData: FormData) {
  await requireSession();

  const entity = text(formData, "entity");
  const id = text(formData, "id");
  const direction = text(formData, "direction");
  const path = currentPath(formData);

  const ids = await orderedIds(entity);
  const index = ids.indexOf(id);
  const target = direction === "up" ? index - 1 : index + 1;

  if (index === -1 || target < 0 || target >= ids.length) {
    redirect(path);
  }

  [ids[index], ids[target]] = [ids[target], ids[index]];
  await applyOrder(entity, ids);

  revalidatePath(path);
  redirect(path);
}
