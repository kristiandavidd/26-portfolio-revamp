import { imageSize } from "image-size";
import { prisma } from "@repo/db";
import { deleteFromSilos, uploadToSilos } from "@repo/integrations";
import type { AssetInfo } from "@/components/panel/AssetField";

/** Every asset the panel can show, keyed by id for the form fields. */
export async function getAssetMap(): Promise<Map<string, AssetInfo>> {
  const assets = await prisma.asset.findMany({
    where: { status: 1 },
    select: {
      id: true,
      url: true,
      originalName: true,
      width: true,
      height: true,
    },
  });

  return new Map(assets.map((asset) => [asset.id, asset]));
}

/**
 * Reads an asset field from a submitted form. When the browser sent a file it
 * is stored in Silos first, so the record can point at the new asset in the
 * same save.
 */
export async function resolveAssetField(
  formData: FormData,
  field: string,
  folder: string,
): Promise<string | null> {
  const file = formData.get(`${field}File`);

  if (file instanceof File && file.size > 0) {
    const asset = await createAssetFromFile(file, folder);
    return asset.id;
  }

  const value = formData.get(field);
  const id = typeof value === "string" ? value.trim() : "";
  return id || null;
}

export async function createAssetFromFile(file: File, folder: string) {
  const buffer = Buffer.from(await file.arrayBuffer());

  let width: number | null = null;
  let height: number | null = null;
  try {
    const size = imageSize(buffer);
    width = size.width ?? null;
    height = size.height ?? null;
  } catch {
    // Not an image, or a format image-size cannot read. Metadata stays empty.
  }

  const stored = await uploadToSilos(
    new Blob([new Uint8Array(buffer)], {
      type: file.type || "application/octet-stream",
    }),
    { filename: file.name },
  );

  return prisma.asset.create({
    data: {
      silosFileId: stored.id,
      filename: stored.filename,
      originalName: file.name,
      mimeType: stored.mime_type || file.type || "application/octet-stream",
      sizeBytes: stored.size ?? file.size,
      url: stored.url,
      width,
      height,
      kind: (stored.mime_type || file.type).startsWith("image/")
        ? "image"
        : "document",
      scope: "portfolio",
      folder,
    },
  });
}

/** Releases the assets a save replaced, as long as nothing else points at them. */
export async function releaseReplacedAssets(
  previous: Array<string | null | undefined>,
  next: Array<string | null | undefined>,
) {
  const keep = new Set(next.filter((id): id is string => Boolean(id)));
  const released = new Set<string>();

  for (const id of previous) {
    if (!id || keep.has(id)) continue;
    released.add(id);
  }

  for (const id of released) {
    await releaseAsset(id);
  }
}

/** Deletes an unreferenced asset from Silos and the database. */
export async function releaseAsset(assetId: string | null | undefined) {
  if (!assetId) return;

  try {
    if (await isAssetReferenced(assetId)) return;

    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      select: { silosFileId: true },
    });
    if (!asset) return;

    try {
      await deleteFromSilos(asset.silosFileId);
    } catch (error) {
      // The row still goes: leaving it behind for a file that is already gone
      // would make the library lie. The log keeps the trail.
      console.warn("Silos delete failed", error);
    }

    await prisma.asset.delete({ where: { id: assetId } });
  } catch (error) {
    console.warn("Asset cleanup failed", error);
  }
}

async function isAssetReferenced(assetId: string) {
  const [
    profiles,
    patterns,
    companies,
    projects,
    products,
    certifications,
    personalProfiles,
    personalPlaces,
    personalGallery,
    personalWishlist,
  ] = await prisma.$transaction([
    prisma.profile.count({
      where: {
        OR: [
          { logoAssetId: assetId },
          { heroPortraitAssetId: assetId },
          { aboutBackgroundAssetId: assetId },
          { footerBackgroundAssetId: assetId },
        ],
      },
    }),
    prisma.heroPattern.count({ where: { assetId } }),
    prisma.company.count({ where: { logoAssetId: assetId } }),
    prisma.project.count({
      where: {
        OR: [
          { logoAssetId: assetId },
          { backgroundAssetId: assetId },
          { foregroundAssetId: assetId },
          { sectionBackgroundAssetId: assetId },
        ],
      },
    }),
    prisma.dephiliaProduct.count({
      where: {
        OR: [{ iconAssetId: assetId }, { backgroundAssetId: assetId }],
      },
    }),
    prisma.certification.count({ where: { logoAssetId: assetId } }),
    prisma.personalProfile.count({
      where: {
        OR: [{ portraitAssetId: assetId }, { heroAssetId: assetId }],
      },
    }),
    prisma.personalPlace.count({ where: { imageAssetId: assetId } }),
    prisma.personalGalleryItem.count({ where: { imageAssetId: assetId } }),
    prisma.personalWishlistItem.count({ where: { imageAssetId: assetId } }),
  ]);

  return (
    profiles +
      patterns +
      companies +
      projects +
      products +
      certifications +
      personalProfiles +
      personalPlaces +
      personalGallery +
      personalWishlist >
    0
  );
}
