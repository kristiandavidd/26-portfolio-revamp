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
  scope: "portfolio" | "personal" | "shared" = "portfolio",
): Promise<string | null> {
  // The browser already uploaded the bytes; the row is created here so an
  // abandoned form never leaves an asset behind.
  const pending = readPendingUpload(formData.get(`${field}Pending`));
  if (pending) {
    const asset = await createAssetFromUpload(pending, folder, scope);
    return asset.id;
  }

  const file = formData.get(`${field}File`);

  if (file instanceof File && file.size > 0) {
    const asset = await createAssetFromFile(file, folder, scope);
    return asset.id;
  }

  const value = formData.get(field);
  const id = typeof value === "string" ? value.trim() : "";
  return id || null;
}

export async function createAssetFromFile(
  file: File,
  folder: string,
  scope: "portfolio" | "personal" | "shared" = "portfolio",
) {
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

  const mimeType = stored.mime_type || file.type || "application/octet-stream";

  return prisma.asset.create({
    data: {
      silosFileId: stored.id,
      filename: stored.filename,
      originalName: file.name,
      mimeType,
      sizeBytes: stored.size ?? file.size,
      url: stored.url,
      width,
      height,
      kind: kindFor(mimeType),
      scope,
      folder,
    },
  });
}

function kindFor(mimeType: string) {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.startsWith("video/")) return "video";
  return "document";
}

type PendingAssetUpload = {
  fileId: string;
  url: string;
  filename: string;
  originalName?: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
};

/** The JSON an uploader leaves behind after the browser finished uploading. */
function readPendingUpload(
  raw: FormDataEntryValue | null,
): PendingAssetUpload | null {
  if (typeof raw !== "string" || !raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    const value = parsed as Partial<PendingAssetUpload>;
    if (
      typeof value.fileId !== "string" ||
      typeof value.url !== "string" ||
      typeof value.filename !== "string" ||
      typeof value.mimeType !== "string" ||
      typeof value.size !== "number"
    ) {
      return null;
    }

    return {
      fileId: value.fileId,
      url: value.url,
      filename: value.filename,
      originalName: value.originalName,
      mimeType: value.mimeType,
      size: value.size,
      width: typeof value.width === "number" ? value.width : null,
      height: typeof value.height === "number" ? value.height : null,
    };
  } catch {
    return null;
  }
}

async function createAssetFromUpload(
  pending: PendingAssetUpload,
  folder: string,
  scope: "portfolio" | "personal" | "shared",
) {
  return prisma.asset.create({
    data: {
      silosFileId: pending.fileId,
      filename: pending.filename,
      originalName: pending.originalName || pending.filename,
      mimeType: pending.mimeType,
      sizeBytes: pending.size,
      url: pending.url,
      width: pending.width,
      height: pending.height,
      kind: kindFor(pending.mimeType),
      scope,
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
    settings,
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
    prisma.siteSetting.count({
      where: {
        OR: [
          { musicAssetId: assetId },
          { portfolioFaviconAssetId: assetId },
          { personalFaviconAssetId: assetId },
          { manageFaviconAssetId: assetId },
        ],
      },
    }),
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
    personalWishlist +
    settings >
    0
  );
}
