import { prisma } from "@repo/db";

/**
 * Every list the panel can reorder or switch on/off. Kept in one place so the
 * generic actions and the row controls cannot drift apart.
 */
export const ENTITIES = [
  "experience",
  "company",
  "project",
  "product",
  "certification",
  "community",
  "chapter",
  "subchapter",
  "paragraph",
  "place",
  "gallery",
  "wishlist",
] as const;

export type Entity = (typeof ENTITIES)[number];

export function isEntity(value: string): value is Entity {
  return (ENTITIES as readonly string[]).includes(value);
}

export async function orderedIds(
  entity: Entity,
  scope = "",
): Promise<string[]> {
  switch (entity) {
    case "experience":
      return (
        await prisma.experience.findMany({
          where: { deletedAt: null },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: { id: true },
        })
      ).map((row) => row.id);
    case "company":
      return (
        await prisma.company.findMany({
          where: { deletedAt: null },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: { id: true },
        })
      ).map((row) => row.id);
    case "project":
      return (
        await prisma.project.findMany({
          where: { deletedAt: null },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: { id: true },
        })
      ).map((row) => row.id);
    case "product":
      return (
        await prisma.dephiliaProduct.findMany({
          where: { deletedAt: null },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: { id: true },
        })
      ).map((row) => row.id);
    case "certification":
      return (
        await prisma.certification.findMany({
          where: { deletedAt: null },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: { id: true },
        })
      ).map((row) => row.id);
    case "community":
      return (
        await prisma.communityRole.findMany({
          where: { deletedAt: null },
          orderBy: [{ sortOrder: "asc" }],
          select: { id: true },
        })
      ).map((row) => row.id);
    case "chapter":
      return (
        await prisma.personalChapter.findMany({
          where: { deletedAt: null },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: { id: true },
        })
      ).map((row) => row.id);
    case "subchapter":
      return (
        await prisma.personalSubchapter.findMany({
          where: { chapterId: scope, deletedAt: null },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: { id: true },
        })
      ).map((row) => row.id);
    case "paragraph":
      return (
        await prisma.personalParagraph.findMany({
          where: { subchapterId: scope, deletedAt: null },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: { id: true },
        })
      ).map((row) => row.id);
    case "place":
      return (
        await prisma.personalPlace.findMany({
          where: { deletedAt: null },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: { id: true },
        })
      ).map((row) => row.id);
    case "gallery":
      return (
        await prisma.personalGalleryItem.findMany({
          where: { deletedAt: null },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: { id: true },
        })
      ).map((row) => row.id);
    case "wishlist":
      return (
        await prisma.personalWishlistItem.findMany({
          where: { deletedAt: null },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: { id: true },
        })
      ).map((row) => row.id);
  }
}

export async function applyOrder(entity: Entity, ids: string[]) {
  switch (entity) {
    case "experience":
      await prisma.$transaction(
        ids.map((id, sortOrder) =>
          prisma.experience.update({ where: { id }, data: { sortOrder } }),
        ),
      );
      break;
    case "company":
      await prisma.$transaction(
        ids.map((id, sortOrder) =>
          prisma.company.update({ where: { id }, data: { sortOrder } }),
        ),
      );
      break;
    case "project":
      await prisma.$transaction(
        ids.map((id, sortOrder) =>
          prisma.project.update({ where: { id }, data: { sortOrder } }),
        ),
      );
      break;
    case "product":
      await prisma.$transaction(
        ids.map((id, sortOrder) =>
          prisma.dephiliaProduct.update({ where: { id }, data: { sortOrder } }),
        ),
      );
      break;
    case "certification":
      await prisma.$transaction(
        ids.map((id, sortOrder) =>
          prisma.certification.update({ where: { id }, data: { sortOrder } }),
        ),
      );
      break;
    case "community":
      await prisma.$transaction(
        ids.map((id, sortOrder) =>
          prisma.communityRole.update({ where: { id }, data: { sortOrder } }),
        ),
      );
      break;
    case "chapter":
      await prisma.$transaction(
        ids.map((id, sortOrder) =>
          prisma.personalChapter.update({ where: { id }, data: { sortOrder } }),
        ),
      );
      break;
    case "subchapter":
      await prisma.$transaction(
        ids.map((id, sortOrder) =>
          prisma.personalSubchapter.update({
            where: { id },
            data: { sortOrder },
          }),
        ),
      );
      break;
    case "paragraph":
      await prisma.$transaction(
        ids.map((id, sortOrder) =>
          prisma.personalParagraph.update({
            where: { id },
            data: { sortOrder },
          }),
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

/** New rows go after everything else, so creation never disturbs the order. */
export async function nextSortOrder(
  entity: Entity,
  scope = "",
): Promise<number> {
  switch (entity) {
    case "experience": {
      const row = await prisma.experience.aggregate({ _max: { sortOrder: true } });
      return (row._max.sortOrder ?? -1) + 1;
    }
    case "company": {
      const row = await prisma.company.aggregate({ _max: { sortOrder: true } });
      return (row._max.sortOrder ?? -1) + 1;
    }
    case "project": {
      const row = await prisma.project.aggregate({ _max: { sortOrder: true } });
      return (row._max.sortOrder ?? -1) + 1;
    }
    case "product": {
      const row = await prisma.dephiliaProduct.aggregate({
        _max: { sortOrder: true },
      });
      return (row._max.sortOrder ?? -1) + 1;
    }
    case "certification": {
      const row = await prisma.certification.aggregate({
        _max: { sortOrder: true },
      });
      return (row._max.sortOrder ?? -1) + 1;
    }
    case "community": {
      const row = await prisma.communityRole.aggregate({
        _max: { sortOrder: true },
      });
      return (row._max.sortOrder ?? -1) + 1;
    }
    case "chapter": {
      const row = await prisma.personalChapter.aggregate({
        _max: { sortOrder: true },
      });
      return (row._max.sortOrder ?? -1) + 1;
    }
    case "subchapter": {
      const row = await prisma.personalSubchapter.aggregate({
        where: { chapterId: scope },
        _max: { sortOrder: true },
      });
      return (row._max.sortOrder ?? -1) + 1;
    }
    case "paragraph": {
      const row = await prisma.personalParagraph.aggregate({
        where: { subchapterId: scope },
        _max: { sortOrder: true },
      });
      return (row._max.sortOrder ?? -1) + 1;
    }
    case "place": {
      const row = await prisma.personalPlace.aggregate({
        _max: { sortOrder: true },
      });
      return (row._max.sortOrder ?? -1) + 1;
    }
    case "gallery": {
      const row = await prisma.personalGalleryItem.aggregate({
        _max: { sortOrder: true },
      });
      return (row._max.sortOrder ?? -1) + 1;
    }
    case "wishlist": {
      const row = await prisma.personalWishlistItem.aggregate({
        _max: { sortOrder: true },
      });
      return (row._max.sortOrder ?? -1) + 1;
    }
  }
}

/** Soft delete: the row stays for the record, but every screen ignores it. */
export async function archiveEntity(entity: Entity, id: string) {
  const data = { deletedAt: new Date(), status: 0 };

  switch (entity) {
    case "experience":
      await prisma.experience.update({ where: { id }, data });
      break;
    case "company":
      await prisma.company.update({ where: { id }, data });
      break;
    case "project":
      await prisma.project.update({ where: { id }, data });
      break;
    case "product":
      await prisma.dephiliaProduct.update({ where: { id }, data });
      break;
    case "certification":
      await prisma.certification.update({ where: { id }, data });
      break;
    case "community":
      await prisma.communityRole.update({ where: { id }, data });
      break;
    case "chapter":
      await prisma.personalChapter.update({ where: { id }, data });
      break;
    case "subchapter":
      await prisma.personalSubchapter.update({ where: { id }, data });
      break;
    case "paragraph":
      await prisma.personalParagraph.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      break;
    case "place":
      await prisma.personalPlace.update({ where: { id }, data });
      break;
    case "gallery":
      await prisma.personalGalleryItem.update({ where: { id }, data });
      break;
    case "wishlist":
      await prisma.personalWishlistItem.update({ where: { id }, data });
      break;
  }
}

export async function setEntityStatus(
  entity: Entity,
  id: string,
  status: number,
) {
  const data = { status };

  switch (entity) {
    case "experience":
      await prisma.experience.update({ where: { id }, data });
      break;
    case "company":
      await prisma.company.update({ where: { id }, data });
      break;
    case "project":
      await prisma.project.update({ where: { id }, data });
      break;
    case "product":
      await prisma.dephiliaProduct.update({ where: { id }, data });
      break;
    case "certification":
      await prisma.certification.update({ where: { id }, data });
      break;
    case "community":
      await prisma.communityRole.update({ where: { id }, data });
      break;
    case "chapter":
      await prisma.personalChapter.update({ where: { id }, data });
      break;
    case "subchapter":
      await prisma.personalSubchapter.update({ where: { id }, data });
      break;
    case "place":
      await prisma.personalPlace.update({ where: { id }, data });
      break;
    case "gallery":
      await prisma.personalGalleryItem.update({ where: { id }, data });
      break;
    case "wishlist":
      await prisma.personalWishlistItem.update({ where: { id }, data });
      break;
  }
}
