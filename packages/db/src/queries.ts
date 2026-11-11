import { Prisma } from "@prisma/client";
import { prisma } from "./client";
import {
  BRAND_ACCENT,
  FALLBACK_CONTENT,
  type CertificationView,
  type CommunityRoleView,
  type DephiliaProductView,
  type ExperienceView,
  type PersonalContent,
  type PersonalImageView,
  type ProjectView,
  type SiteContent,
} from "./types";

const assetRef = { select: { url: true } } satisfies Prisma.AssetDefaultArgs;
const sizedAssetRef = {
  select: { url: true, width: true, height: true },
} satisfies Prisma.AssetDefaultArgs;

const profileInclude = {
  logoAsset: assetRef,
  heroPortraitAsset: sizedAssetRef,
  aboutBackgroundAsset: assetRef,
  footerBackgroundAsset: assetRef,
  socials: {
    where: { status: 1 },
    orderBy: { sortOrder: "asc" },
  },
  heroPatterns: {
    where: { status: 1 },
    orderBy: { sortOrder: "asc" },
    include: { asset: sizedAssetRef },
  },
} satisfies Prisma.ProfileInclude;

const experienceInclude = {
  company: { include: { logo: assetRef } },
  highlights: { orderBy: { sortOrder: "asc" } },
} satisfies Prisma.ExperienceInclude;

const projectInclude = {
  company: { include: { logo: assetRef } },
  logoAsset: assetRef,
  backgroundAsset: assetRef,
  foregroundAsset: assetRef,
  sectionBackgroundAsset: assetRef,
  features: { orderBy: { sortOrder: "asc" } },
  tags: { include: { tag: true } },
} satisfies Prisma.ProjectInclude;

type ProjectRow = Prisma.ProjectGetPayload<{ include: typeof projectInclude }>;

function optional(value: string | null | undefined) {
  return value ?? undefined;
}

function mapProject(row: ProjectRow): ProjectView {
  return {
    slug: row.slug,
    name: row.name,
    logo: optional(row.logoAsset?.url ?? row.company?.logo?.url),
    background: optional(row.backgroundAsset?.url),
    foreground: optional(row.foregroundAsset?.url),
    sectionBackground: optional(row.sectionBackgroundAsset?.url),
    accent: optional(row.accent),
    blurb: row.blurb,
    summary: row.summary,
    company: optional(row.company?.name),
    period: optional(row.periodLabel),
    role: optional(row.role),
    tags: row.tags
      .map((entry) => entry.tag)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((tag) => tag.name),
    features: row.features.map((feature) => feature.content),
  };
}

const DEPHILIA_DEFAULT = FALLBACK_CONTENT.dephilia;

/**
 * Everything the portfolio and personal apps render, in one round trip set.
 * An empty database falls back to the static copy so a fresh deploy still
 * renders instead of throwing.
 */
export async function getSiteContent(): Promise<SiteContent> {
  const [
    profileRow,
    experienceRows,
    projectRows,
    productRows,
    certificationRows,
    communityRows,
    educationRow,
  ] = await Promise.all([
    prisma.profile.findUnique({ where: { id: 1 }, include: profileInclude }),
    prisma.experience.findMany({
      where: { status: 1, deletedAt: null },
      orderBy: { sortOrder: "asc" },
      include: experienceInclude,
    }),
    prisma.project.findMany({
      where: { status: 1, deletedAt: null },
      orderBy: { sortOrder: "asc" },
      include: projectInclude,
    }),
    prisma.dephiliaProduct.findMany({
      where: { status: 1, deletedAt: null },
      orderBy: { sortOrder: "asc" },
      include: { iconAsset: assetRef, backgroundAsset: assetRef },
    }),
    prisma.certification.findMany({
      where: { status: 1, deletedAt: null },
      orderBy: { sortOrder: "asc" },
      include: { logoAsset: assetRef },
    }),
    prisma.communityRole.findMany({
      where: { status: 1, deletedAt: null },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.education.findUnique({ where: { id: 1 } }),
  ]);

  const profile = profileRow
    ? {
      name: profileRow.name,
      fullName: profileRow.fullName,
      role: profileRow.role,
      location: profileRow.location,
      email: profileRow.email,
      bio: profileRow.bio,
      heroLine1: profileRow.heroLine1 || FALLBACK_CONTENT.profile.heroLine1,
      heroLine2: profileRow.heroLine2 || FALLBACK_CONTENT.profile.heroLine2,
      aboutHeading: profileRow.aboutHeading,
      footerTagline: profileRow.footerTagline,
      logoUrl: profileRow.logoAsset?.url ?? null,
      heroPortraitUrl: profileRow.heroPortraitAsset?.url ?? null,
      heroPortraitWidth: profileRow.heroPortraitAsset?.width ?? null,
      heroPortraitHeight: profileRow.heroPortraitAsset?.height ?? null,
      aboutBackgroundUrl: profileRow.aboutBackgroundAsset?.url ?? null,
      footerBackgroundUrl: profileRow.footerBackgroundAsset?.url ?? null,
      heroPatterns: profileRow.heroPatterns.map((item) => ({
        url: item.asset.url,
        width: item.asset.width,
        height: item.asset.height,
      })),
      socials: profileRow.socials.map((social) => ({
        label: social.label,
        url: social.url,
        icon: social.icon,
      })),
    }
    : FALLBACK_CONTENT.profile;

  const experience: ExperienceView[] = experienceRows.map((row) => ({
    company: row.company.name,
    logo: row.company.logo?.url ?? null,
    role: row.role,
    period: row.periodLabel,
    current: row.isCurrent,
    highlights: row.highlights.map((highlight) => highlight.content),
  }));

  const projects = projectRows.map(mapProject);

  const dephiliaProducts: DephiliaProductView[] = productRows.map((row) => ({
    name: row.name,
    category: row.category,
    description: row.description,
    accent: optional(row.accent),
    icon: optional(row.iconAsset?.url),
    background: optional(row.backgroundAsset?.url),
  }));

  const certifications: CertificationView[] = certificationRows.map((row) => ({
    name: row.name,
    issuer: row.issuer,
    period: row.periodLabel,
    accent: optional(row.accent),
    logo: optional(row.logoAsset?.url),
    credentialId: optional(row.credentialId),
    url: optional(row.url),
  }));

  const community: CommunityRoleView[] = communityRows.map((row) => ({
    programme: row.programme,
    role: row.role,
    period: row.periodLabel,
    icon: row.icon,
    metric: row.metric,
    metricNote: row.metricNote,
  }));

  return {
    profile,
    experience,
    projects,
    dephilia: DEPHILIA_DEFAULT,
    dephiliaProducts,
    certifications,
    community,
    education: educationRow
      ? {
        school: educationRow.school,
        degree: educationRow.degree,
        period: educationRow.periodLabel,
        detail: educationRow.detail,
      }
      : FALLBACK_CONTENT.education,
    settings: FALLBACK_CONTENT.settings,
  };
}

const personalImage = {
  select: { url: true, width: true, height: true },
} satisfies Prisma.AssetDefaultArgs;

function toPersonalImage(
  asset: { url: string; width: number | null; height: number | null } | null,
): PersonalImageView | null {
  return asset
    ? { url: asset.url, width: asset.width, height: asset.height }
    : null;
}

export async function getPersonalContent(): Promise<PersonalContent> {
  const [profile, story, places, gallery, wishlist] = await Promise.all([
    prisma.personalProfile.findUnique({
      where: { id: 1 },
      include: {
        portraitAsset: personalImage,
        heroAsset: personalImage,
      },
    }),
    prisma.personalChapter.findMany({
      where: { status: 1, deletedAt: null },
      orderBy: { sortOrder: "asc" },
      include: {
        subchapters: {
          where: { status: 1, deletedAt: null },
          orderBy: { sortOrder: "asc" },
          include: {
            paragraphs: {
              where: { deletedAt: null },
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    }),
    prisma.personalPlace.findMany({
      where: { status: 1, deletedAt: null },
      orderBy: { sortOrder: "asc" },
      include: { imageAsset: personalImage },
    }),
    prisma.personalGalleryItem.findMany({
      where: { status: 1, deletedAt: null },
      orderBy: { sortOrder: "asc" },
      include: { imageAsset: personalImage },
    }),
    prisma.personalWishlistItem.findMany({
      where: { status: 1, deletedAt: null },
      orderBy: { sortOrder: "asc" },
      include: { imageAsset: personalImage },
    }),
  ]);

  return {
    profile: {
      name: profile?.name ?? "",
      headline: profile?.headline ?? "",
      intro: profile?.intro ?? "",
      location: profile?.location ?? "",
      email: profile?.email ?? "",
      portrait: toPersonalImage(profile?.portraitAsset ?? null),
      hero: toPersonalImage(profile?.heroAsset ?? null),
    },
    story: story.map((chapter) => ({
      id: chapter.id,
      year: chapter.year,
      title: chapter.title,
      subchapters: chapter.subchapters.map((subchapter) => ({
        id: subchapter.id,
        title: subchapter.title,
        paragraphs: subchapter.paragraphs.map((paragraph) => ({
          id: paragraph.id,
          body: paragraph.body,
        })),
      })),
    })),
    places: places.map((row) => ({
      id: row.id,
      name: row.name,
      region: row.region,
      year: row.year,
      note: row.note,
      mapsUrl: row.mapsUrl,
      image: toPersonalImage(row.imageAsset),
    })),
    gallery: gallery.map((row) => ({
      id: row.id,
      title: row.title,
      year: row.year,
      note: row.note,
      image: toPersonalImage(row.imageAsset),
    })),
    wishlist: wishlist.map((row) => ({
      id: row.id,
      title: row.title,
      note: row.note,
      done: row.done,
      image: toPersonalImage(row.imageAsset),
    })),
  };
}

export { BRAND_ACCENT };
