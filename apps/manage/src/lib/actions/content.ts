"use server";

import { prisma } from "@repo/db";
import { requireSession } from "@/lib/auth";
import { releaseReplacedAssets, resolveAssetField } from "@/lib/assets";
import { archiveEntity, nextSortOrder } from "@/lib/entities";
import {
  checkbox,
  commaList,
  errorMessage,
  fail,
  finish,
  lines,
  nullableText,
  slugify,
  text,
} from "@/lib/forms";

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export async function saveProfile(formData: FormData) {
  await requireSession();

  const before = await prisma.profile.findUnique({
    where: { id: 1 },
    select: {
      logoAssetId: true,
      heroPortraitAssetId: true,
      aboutBackgroundAssetId: true,
      footerBackgroundAssetId: true,
      heroPatterns: {
        select: { assetId: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  const name = text(formData, "name");

  if (!name) {
    return fail(formData, "The profile needs a name.");
  }

  const labels = formData.getAll("socialLabel").map((value) => String(value).trim());
  const urls = formData.getAll("socialUrl").map((value) => String(value).trim());
  const icons = formData.getAll("socialIcon").map((value) => String(value).trim());

  const socials = labels
    .map((label, index) => ({
      label,
      url: urls[index] ?? "",
      icon: icons[index] || "website",
      sortOrder: index,
    }))
    .filter((social) => social.label && social.url);

  let keptAssets: Array<string | null> = [];

  try {
    const patternAssets: string[] = [];
    for (let index = 0; index < 4; index += 1) {
      const assetId = await resolveAssetField(
        formData,
        `patternAssetId-${index}`,
        "profile",
      );
      if (assetId) patternAssets.push(assetId);
    }

    const profile = {
      name,
      fullName: text(formData, "fullName"),
      role: text(formData, "role"),
      location: text(formData, "location"),
      email: text(formData, "email"),
      bio: text(formData, "bio"),
      heroLine1: text(formData, "heroLine1"),
      heroLine2: text(formData, "heroLine2"),
      aboutHeading: text(formData, "aboutHeading"),
      footerTagline: text(formData, "footerTagline"),
      logoAssetId: await resolveAssetField(formData, "logoAssetId", "profile"),
      heroPortraitAssetId: await resolveAssetField(
        formData,
        "heroPortraitAssetId",
        "profile",
      ),
      aboutBackgroundAssetId: await resolveAssetField(
        formData,
        "aboutBackgroundAssetId",
        "profile",
      ),
      footerBackgroundAssetId: await resolveAssetField(
        formData,
        "footerBackgroundAssetId",
        "profile",
      ),
    };

    await prisma.$transaction([
      prisma.profile.upsert({
        where: { id: 1 },
        update: profile,
        create: { id: 1, ...profile },
      }),
      prisma.socialLink.deleteMany({ where: { profileId: 1 } }),
      prisma.socialLink.createMany({
        data: socials.map((social) => ({ ...social, profileId: 1 })),
      }),
      prisma.heroPattern.deleteMany({ where: { profileId: 1 } }),
      prisma.heroPattern.createMany({
        data: patternAssets.map((assetId, index) => ({
          profileId: 1,
          assetId,
          sortOrder: index,
        })),
      }),
    ]);

    keptAssets = [
      profile.logoAssetId,
      profile.heroPortraitAssetId,
      profile.aboutBackgroundAssetId,
      profile.footerBackgroundAssetId,
      ...patternAssets,
    ];
  } catch (error) {
    return fail(formData, errorMessage(error));
  }

  await releaseReplacedAssets(
    [
      before?.logoAssetId,
      before?.heroPortraitAssetId,
      before?.aboutBackgroundAssetId,
      before?.footerBackgroundAssetId,
      ...(before?.heroPatterns.map((pattern) => pattern.assetId) ?? []),
    ],
    keptAssets,
  );

  await finish(formData, "Profile saved.");
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

async function resolveTagIds(tags: string[]) {
  const ids: string[] = [];

  for (const name of tags) {
    const slug = slugify(name);
    if (!slug) continue;
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: { name },
      create: { slug, name },
    });
    ids.push(tag.id);
  }

  return ids;
}

/**
 * Slugs are never typed by hand. A new row derives one from its name and falls
 * back to a suffix if that slug is already taken; an existing row keeps the slug
 * it was published with so its URL stays stable.
 */
async function autoSlug(
  kind: "project" | "company" | "product",
  name: string,
) {
  const base = slugify(name) || "item";
  let candidate = base;
  let counter = 2;

  for (;;) {
    const existing =
      kind === "project"
        ? await prisma.project.findUnique({
            where: { slug: candidate },
            select: { id: true },
          })
        : kind === "company"
          ? await prisma.company.findUnique({
              where: { slug: candidate },
              select: { id: true },
            })
          : await prisma.dephiliaProduct.findUnique({
              where: { slug: candidate },
              select: { id: true },
            });

    if (!existing) return candidate;
    candidate = `${base}-${counter}`;
    counter += 1;
  }
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export async function saveProject(formData: FormData) {
  await requireSession();

  const id = text(formData, "id");
  const name = text(formData, "name");

  if (!name) {
    return fail(formData, "A project needs a name.");
  }

  const before = id
    ? await prisma.project.findUnique({
        where: { id },
        select: {
          slug: true,
          logoAssetId: true,
          backgroundAssetId: true,
          foregroundAssetId: true,
          sectionBackgroundAssetId: true,
        },
      })
    : null;

  let keptAssets: Array<string | null> = [];

  try {
    const slug = before?.slug ?? (await autoSlug("project", name));

    const base = {
      slug,
      name,
      companyId: nullableText(formData, "companyId"),
      logoAssetId: await resolveAssetField(formData, "logoAssetId", "projects"),
      backgroundAssetId: await resolveAssetField(
        formData,
        "backgroundAssetId",
        "projects",
      ),
      foregroundAssetId: await resolveAssetField(
        formData,
        "foregroundAssetId",
        "projects",
      ),
      sectionBackgroundAssetId: await resolveAssetField(
        formData,
        "sectionBackgroundAssetId",
        "projects",
      ),
      accent: nullableText(formData, "accent"),
      blurb: text(formData, "blurb"),
      summary: text(formData, "summary"),
      role: nullableText(formData, "role"),
      periodLabel: nullableText(formData, "periodLabel"),
    };

    const features = lines(formData, "features");
    const tagIds = await resolveTagIds(commaList(formData, "tags"));

    let projectId = id;

    if (id) {
      await prisma.project.update({ where: { id }, data: base });
    } else {
      const created = await prisma.project.create({
        data: {
          ...base,
          status: 1,
          sortOrder: await nextSortOrder("project"),
        },
      });
      projectId = created.id;
    }

    await prisma.$transaction([
      prisma.projectFeature.deleteMany({ where: { projectId } }),
      prisma.projectFeature.createMany({
        data: features.map((content, index) => ({
          projectId,
          content,
          sortOrder: index,
        })),
      }),
      prisma.projectTag.deleteMany({ where: { projectId } }),
      prisma.projectTag.createMany({
        data: tagIds.map((tagId) => ({ projectId, tagId })),
      }),
    ]);

    keptAssets = [
      base.logoAssetId,
      base.backgroundAssetId,
      base.foregroundAssetId,
      base.sectionBackgroundAssetId,
    ];
  } catch (error) {
    return fail(formData, errorMessage(error));
  }

  if (before) {
    await releaseReplacedAssets(
      [
        before.logoAssetId,
        before.backgroundAssetId,
        before.foregroundAssetId,
        before.sectionBackgroundAssetId,
      ],
      keptAssets,
    );
  }

  await finish(formData, id ? "Project updated." : "Project created.");
}

export async function deleteProject(formData: FormData) {
  await requireSession();

  try {
    await archiveEntity("project", text(formData, "id"));
  } catch (error) {
    return fail(formData, errorMessage(error));
  }

  await finish(formData, "Project deleted.");
}

// ---------------------------------------------------------------------------
// Companies
// ---------------------------------------------------------------------------

export async function saveCompany(formData: FormData) {
  await requireSession();

  const id = text(formData, "id");
  const name = text(formData, "name");

  if (!name) {
    return fail(formData, "A company needs a name.");
  }

  const before = id
    ? await prisma.company.findUnique({
        where: { id },
        select: { slug: true, logoAssetId: true },
      })
    : null;

  let keptAsset: string | null = null;

  try {
    const base = {
      slug: before?.slug ?? (await autoSlug("company", name)),
      name,
      website: nullableText(formData, "website"),
      summary: nullableText(formData, "summary"),
      logoAssetId: await resolveAssetField(formData, "logoAssetId", "company"),
    };

    if (id) {
      await prisma.company.update({ where: { id }, data: base });
    } else {
      await prisma.company.create({
        data: {
          ...base,
          status: 1,
          sortOrder: await nextSortOrder("company"),
        },
      });
    }

    keptAsset = base.logoAssetId;
  } catch (error) {
    return fail(formData, errorMessage(error));
  }

  if (before) {
    await releaseReplacedAssets([before.logoAssetId], [keptAsset]);
  }

  await finish(formData, id ? "Company updated." : "Company created.");
}

export async function deleteCompany(formData: FormData) {
  await requireSession();

  try {
    await archiveEntity("company", text(formData, "id"));
  } catch (error) {
    return fail(formData, errorMessage(error));
  }

  await finish(formData, "Company deleted.");
}

// ---------------------------------------------------------------------------
// Experience
// ---------------------------------------------------------------------------

export async function saveExperience(formData: FormData) {
  await requireSession();

  const id = text(formData, "id");
  const companyId = text(formData, "companyId");
  const role = text(formData, "role");

  if (!companyId || !role) {
    return fail(formData, "Pick a company and give the role a title.");
  }

  const base = {
    companyId,
    role,
    periodLabel: text(formData, "periodLabel"),
    isCurrent: checkbox(formData, "isCurrent"),
  };

  const highlights = lines(formData, "highlights");

  try {
    let experienceId = id;

    if (id) {
      await prisma.experience.update({ where: { id }, data: base });
    } else {
      const created = await prisma.experience.create({
        data: {
          ...base,
          status: 1,
          sortOrder: await nextSortOrder("experience"),
        },
      });
      experienceId = created.id;
    }

    await prisma.$transaction([
      prisma.experienceHighlight.deleteMany({ where: { experienceId } }),
      prisma.experienceHighlight.createMany({
        data: highlights.map((content, index) => ({
          experienceId,
          content,
          sortOrder: index,
        })),
      }),
    ]);
  } catch (error) {
    return fail(formData, errorMessage(error));
  }

  await finish(formData, id ? "Experience updated." : "Experience created.");
}

export async function deleteExperience(formData: FormData) {
  await requireSession();

  try {
    await archiveEntity("experience", text(formData, "id"));
  } catch (error) {
    return fail(formData, errorMessage(error));
  }

  await finish(formData, "Experience deleted.");
}

// ---------------------------------------------------------------------------
// Dephilia products
// ---------------------------------------------------------------------------

export async function saveProduct(formData: FormData) {
  await requireSession();

  const id = text(formData, "id");
  const name = text(formData, "name");

  if (!name) {
    return fail(formData, "A product needs a name.");
  }

  const before = id
    ? await prisma.dephiliaProduct.findUnique({
        where: { id },
        select: { slug: true, iconAssetId: true, backgroundAssetId: true },
      })
    : null;

  let keptAssets: Array<string | null> = [];

  try {
    const base = {
      slug: before?.slug ?? (await autoSlug("product", name)),
      name,
      category: text(formData, "category"),
      description: text(formData, "description"),
      accent: nullableText(formData, "accent"),
      iconAssetId: await resolveAssetField(formData, "iconAssetId", "dephilia"),
      backgroundAssetId: await resolveAssetField(
        formData,
        "backgroundAssetId",
        "dephilia",
      ),
      url: nullableText(formData, "url"),
    };

    if (id) {
      await prisma.dephiliaProduct.update({ where: { id }, data: base });
    } else {
      await prisma.dephiliaProduct.create({
        data: {
          ...base,
          status: 1,
          sortOrder: await nextSortOrder("product"),
        },
      });
    }

    keptAssets = [base.iconAssetId, base.backgroundAssetId];
  } catch (error) {
    return fail(formData, errorMessage(error));
  }

  if (before) {
    await releaseReplacedAssets(
      [before.iconAssetId, before.backgroundAssetId],
      keptAssets,
    );
  }

  await finish(formData, id ? "Product updated." : "Product created.");
}

export async function deleteProduct(formData: FormData) {
  await requireSession();

  try {
    await archiveEntity("product", text(formData, "id"));
  } catch (error) {
    return fail(formData, errorMessage(error));
  }

  await finish(formData, "Product deleted.");
}

// ---------------------------------------------------------------------------
// Certifications and community
// ---------------------------------------------------------------------------

export async function saveCertification(formData: FormData) {
  await requireSession();

  const id = text(formData, "id");
  const name = text(formData, "name");

  if (!name) {
    return fail(formData, "A credential needs a name.");
  }

  const before = id
    ? await prisma.certification.findUnique({
        where: { id },
        select: { logoAssetId: true },
      })
    : null;

  let keptAsset: string | null = null;

  try {
    const base = {
      name,
      issuer: text(formData, "issuer"),
      periodLabel: text(formData, "periodLabel"),
      accent: nullableText(formData, "accent"),
      logoAssetId: await resolveAssetField(
        formData,
        "logoAssetId",
        "credentials",
      ),
      credentialId: nullableText(formData, "credentialId"),
      url: nullableText(formData, "url"),
    };

    if (id) {
      await prisma.certification.update({ where: { id }, data: base });
    } else {
      await prisma.certification.create({
        data: {
          ...base,
          status: 1,
          sortOrder: await nextSortOrder("certification"),
        },
      });
    }

    keptAsset = base.logoAssetId;
  } catch (error) {
    return fail(formData, errorMessage(error));
  }

  if (before) {
    await releaseReplacedAssets([before.logoAssetId], [keptAsset]);
  }

  await finish(formData, id ? "Credential updated." : "Credential created.");
}

export async function deleteCertification(formData: FormData) {
  await requireSession();

  try {
    await archiveEntity("certification", text(formData, "id"));
  } catch (error) {
    return fail(formData, errorMessage(error));
  }

  await finish(formData, "Credential deleted.");
}

export async function saveCommunityRole(formData: FormData) {
  await requireSession();

  const id = text(formData, "id");
  const programme = text(formData, "programme");

  if (!programme) {
    return fail(formData, "A community entry needs a programme.");
  }

  const base = {
    programme,
    role: text(formData, "role"),
    periodLabel: text(formData, "periodLabel"),
    icon: text(formData, "icon", "cloud"),
    metric: text(formData, "metric"),
    metricNote: text(formData, "metricNote"),
  };

  try {
    if (id) {
      await prisma.communityRole.update({ where: { id }, data: base });
    } else {
      await prisma.communityRole.create({
        data: {
          ...base,
          status: 1,
          sortOrder: await nextSortOrder("community"),
        },
      });
    }
  } catch (error) {
    return fail(formData, errorMessage(error));
  }

  await finish(
    formData,
    id ? "Community entry updated." : "Community entry created.",
  );
}

export async function deleteCommunityRole(formData: FormData) {
  await requireSession();

  try {
    await archiveEntity("community", text(formData, "id"));
  } catch (error) {
    return fail(formData, errorMessage(error));
  }

  await finish(formData, "Community entry deleted.");
}
