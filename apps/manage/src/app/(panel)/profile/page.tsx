import { prisma } from "@repo/db";
import {
  Card,
  Field,
  Input,
  PageHeader,
  Textarea,
} from "@repo/ui";
import { AssetField } from "@/components/panel/AssetField";
import { SelectMenu } from "@/components/panel/SelectMenu";
import { getAssetMap } from "@/lib/assets";
import { saveProfile } from "@/lib/actions/content";

export const dynamic = "force-dynamic";

const SOCIAL_ICONS = ["instagram", "linkedin", "website", "mail"];

export default async function ProfilePage() {
  const [profile, assets] = await Promise.all([
    prisma.profile.findUnique({
      where: { id: 1 },
      include: {
        socials: { orderBy: { sortOrder: "asc" } },
        heroPatterns: { orderBy: { sortOrder: "asc" } },
      },
    }),
    getAssetMap(),
  ]);

  const socials = [...(profile?.socials ?? [])];
  const patterns = profile?.heroPatterns ?? [];
  const patternSlots = [0, 1, 2, 3].map((index) => patterns[index]?.assetId ?? "");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Professional"
        title="Profile"
        description="The copy and marks shared by the hero, about band, footer and metadata."
      />
      <form action={saveProfile} className="flex flex-col gap-6">
        <input type="hidden" name="_path" value="/profile" />

        <Card className="grid gap-5 p-6 sm:grid-cols-2">
          <Field label="Name" htmlFor="name">
            <Input id="name" name="name" defaultValue={profile?.name ?? ""} required />
          </Field>
          <Field label="Full name" htmlFor="fullName" hint="Optional, used in structured data.">
            <Input id="fullName" name="fullName" defaultValue={profile?.fullName ?? ""} />
          </Field>
          <Field label="Role" htmlFor="role">
            <Input id="role" name="role" defaultValue={profile?.role ?? ""} />
          </Field>
          <Field label="Location" htmlFor="location">
            <Input id="location" name="location" defaultValue={profile?.location ?? ""} />
          </Field>
          <Field label="Email" htmlFor="email">
            <Input id="email" name="email" type="email" defaultValue={profile?.email ?? ""} />
          </Field>
          <Field label="Footer tagline" htmlFor="footerTagline">
            <Input
              id="footerTagline"
              name="footerTagline"
              defaultValue={profile?.footerTagline ?? ""}
            />
          </Field>
          <Field label="Hero line 1" htmlFor="heroLine1">
            <Input id="heroLine1" name="heroLine1" defaultValue={profile?.heroLine1 ?? ""} />
          </Field>
          <Field label="Hero line 2 (accent)" htmlFor="heroLine2">
            <Input id="heroLine2" name="heroLine2" defaultValue={profile?.heroLine2 ?? ""} />
          </Field>
          <Field label="About heading" htmlFor="aboutHeading" className="sm:col-span-2">
            <Input
              id="aboutHeading"
              name="aboutHeading"
              defaultValue={profile?.aboutHeading ?? ""}
            />
          </Field>
          <Field label="Bio" htmlFor="bio" className="sm:col-span-2">
            <Textarea id="bio" name="bio" rows={5} defaultValue={profile?.bio ?? ""} />
          </Field>
        </Card>

        <Card className="grid gap-5 p-6 sm:grid-cols-2">
          <h2 className="text-sm font-semibold text-ink sm:col-span-2">
            Artwork
          </h2>
          <AssetField
            label="Logo"
            name="logoAssetId"
            asset={assets.get(profile?.logoAssetId ?? "") ?? null}
          />
          <AssetField
            label="Hero portrait"
            name="heroPortraitAssetId"
            asset={assets.get(profile?.heroPortraitAssetId ?? "") ?? null}
            hint="Its intrinsic size sets the hero layout."
          />
          <AssetField
            label="About background"
            name="aboutBackgroundAssetId"
            asset={assets.get(profile?.aboutBackgroundAssetId ?? "") ?? null}
          />
          <AssetField
            label="Footer background"
            name="footerBackgroundAssetId"
            asset={assets.get(profile?.footerBackgroundAssetId ?? "") ?? null}
          />
        </Card>

        <Card className="flex flex-col gap-4 p-6">
          <div>
            <h2 className="text-sm font-semibold text-ink">Hero patterns</h2>
            <p className="mt-1 text-xs text-muted">
              Up to four frames rotating behind the portrait.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {patternSlots.map((assetId, index) => (
              <AssetField
                key={index}
                label={`Pattern ${index + 1}`}
                name={`patternAssetId-${index}`}
                asset={assets.get(assetId) ?? null}
              />
            ))}
          </div>
        </Card>

        <Card className="flex flex-col gap-4 p-6">
          <div>
            <h2 className="text-sm font-semibold text-ink">Social links</h2>
            <p className="mt-1 text-xs text-muted">
              Leave a row empty to drop it. Order follows the rows.
            </p>
          </div>

          {[...socials, null].map((social, index) => (
            <div key={index} className="grid gap-3 border-t border-line/70 pt-4 sm:grid-cols-[1fr_1.4fr_0.8fr]">
              <Field label="Label" htmlFor={`socialLabel-${index}`}>
                <Input
                  id={`socialLabel-${index}`}
                  name="socialLabel"
                  defaultValue={social?.label ?? ""}
                  placeholder="Instagram"
                />
              </Field>
              <Field label="URL" htmlFor={`socialUrl-${index}`}>
                <Input
                  id={`socialUrl-${index}`}
                  name="socialUrl"
                  defaultValue={social?.url ?? ""}
                  placeholder="https://"
                />
              </Field>
              <Field label="Icon" htmlFor={`socialIcon-${index}`}>
                <SelectMenu
                  id={`socialIcon-${index}`}
                  name="socialIcon"
                  defaultValue={social?.icon ?? "website"}
                  options={SOCIAL_ICONS.map((icon) => ({
                    value: icon,
                    label: icon,
                  }))}
                />
              </Field>
            </div>
          ))}
        </Card>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex h-10 items-center rounded-full bg-brand px-5 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
          >
            Save profile
          </button>
        </div>
      </form>
    </div>
  );
}
