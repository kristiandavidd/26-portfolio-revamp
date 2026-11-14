import { prisma } from "@repo/db";
import { Card, PageHeader } from "@repo/ui";
import { AssetField } from "@/components/panel/AssetField";
import { SubmitButton } from "@/components/panel/SubmitButton";
import { getAssetMap } from "@/lib/assets";
import { saveGeneralSettings } from "@/lib/actions/settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [settings, assets] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { id: 1 } }),
    getAssetMap(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="General"
        title="Settings"
        description="Shared switches for all three apps: the background music and the favicon each one shows."
      />

      <form action={saveGeneralSettings} className="flex flex-col gap-6">
        <input type="hidden" name="_path" value="/settings" />

        <Card className="p-6">
          <h2 className="text-sm font-semibold text-ink">Background music</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            One looped track for both sites, played from a circle beside the
            bottom navigation. The portfolio starts silent; the personal site
            starts playing. Nothing plays while the track is empty.
          </p>

          <div className="mt-5">
            <AssetField
              label="Track"
              name="musicAssetId"
              asset={assets.get(settings?.musicAssetId ?? "") ?? null}
              accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg"
              hint="MP3, WAV or OGG. Anything large goes straight to storage."
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-sm font-semibold text-ink">Favicons</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Each app falls back to its bundled icon until one is uploaded here.
            Square PNG or SVG around 512px works best.
          </p>

          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <AssetField
              label="Portfolio"
              name="portfolioFaviconAssetId"
              asset={
                assets.get(settings?.portfolioFaviconAssetId ?? "") ?? null
              }
            />
            <AssetField
              label="Personal"
              name="personalFaviconAssetId"
              asset={assets.get(settings?.personalFaviconAssetId ?? "") ?? null}
            />
            <AssetField
              label="Panel"
              name="manageFaviconAssetId"
              asset={assets.get(settings?.manageFaviconAssetId ?? "") ?? null}
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <SubmitButton pendingLabel="Saving…">Save settings</SubmitButton>
        </div>
      </form>
    </div>
  );
}
