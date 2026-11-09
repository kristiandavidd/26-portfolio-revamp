import { prisma } from "@repo/db";
import { Card, Field, Input, PageHeader, Textarea } from "@repo/ui";
import { AssetField } from "@/components/panel/AssetField";
import { SubmitButton } from "@/components/panel/SubmitButton";
import { getAssetMap } from "@/lib/assets";
import { savePersonalProfile } from "@/lib/actions/personal";

export const dynamic = "force-dynamic";

export default async function PersonalLandingPage() {
  const [profile, assets] = await Promise.all([
    prisma.personalProfile.findUnique({ where: { id: 1 } }),
    getAssetMap(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Personal"
        title="Landing"
        description="The first screen of the personal site: who you are, in your own voice."
      />

      <form action={savePersonalProfile} className="flex flex-col gap-6">
        <input type="hidden" name="_path" value="/personal" />

        <Card className="grid gap-5 p-6 sm:grid-cols-2">
          <Field label="Name" htmlFor="personal-name">
            <Input
              id="personal-name"
              name="name"
              defaultValue={profile?.name ?? ""}
              required
            />
          </Field>
          <Field
            label="Headline"
            htmlFor="personal-headline"
            hint="One line under the name, e.g. what you do or where you are."
          >
            <Input
              id="personal-headline"
              name="headline"
              defaultValue={profile?.headline ?? ""}
            />
          </Field>
          <Field label="Location" htmlFor="personal-location">
            <Input
              id="personal-location"
              name="location"
              defaultValue={profile?.location ?? ""}
            />
          </Field>
          <Field label="Email" htmlFor="personal-email">
            <Input
              id="personal-email"
              name="email"
              type="email"
              defaultValue={profile?.email ?? ""}
            />
          </Field>
          <Field
            label="Intro"
            htmlFor="personal-intro"
            className="sm:col-span-2"
            hint="Two or three sentences. This is the paragraph beside the portrait."
          >
            <Textarea
              id="personal-intro"
              name="intro"
              rows={6}
              defaultValue={profile?.intro ?? ""}
            />
          </Field>
          <AssetField
            label="Portrait"
            name="portraitAssetId"
            asset={assets.get(profile?.portraitAssetId ?? "") ?? null}
            hint="Shown on the landing. Upload a replacement to swap it."
          />
        </Card>

        <div className="flex justify-end">
          <SubmitButton pendingLabel="Saving…" size="md">
            Save landing
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
