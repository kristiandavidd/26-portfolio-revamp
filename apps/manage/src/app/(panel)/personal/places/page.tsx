import { prisma } from "@repo/db";
import {
  Badge,
  Checkbox,
  Field,
  Input,
  PageHeader,
  Textarea,
} from "@repo/ui";
import { AddPanel } from "@/components/panel/AddPanel";
import { AssetField, type AssetInfo } from "@/components/panel/AssetField";
import { DeleteForm } from "@/components/panel/FormBits";
import { Reorder } from "@/components/panel/PersonalControls";
import { getAssetMap } from "@/lib/assets";
import { deletePersonalPlace, savePersonalPlace } from "@/lib/actions/personal";

export const dynamic = "force-dynamic";

const PATH = "/personal/places";

type PlaceRecord = {
  id: string;
  name: string;
  region: string;
  year: string;
  note: string;
  mapsUrl: string | null;
  imageAssetId: string | null;
  status: number;
};

function PlaceForm({
  place,
  assets,
}: {
  place?: PlaceRecord;
  assets: Map<string, AssetInfo>;
}) {
  const key = place?.id ?? "new";

  return (
    <form action={savePersonalPlace} className="flex flex-col gap-4">
      <input type="hidden" name="_path" value={PATH} />
      {place ? <input type="hidden" name="id" value={place.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Place" htmlFor={`place-name-${key}`}>
          <Input
            id={`place-name-${key}`}
            name="name"
            defaultValue={place?.name ?? ""}
            required
          />
        </Field>
        <Field label="Region" htmlFor={`place-region-${key}`}>
          <Input
            id={`place-region-${key}`}
            name="region"
            defaultValue={place?.region ?? ""}
            placeholder="Central Java, Indonesia"
          />
        </Field>
        <Field
          label="Year"
          htmlFor={`place-year-${key}`}
          hint="Free text, e.g. 2024 or Jan 2024."
        >
          <Input
            id={`place-year-${key}`}
            name="year"
            defaultValue={place?.year ?? ""}
          />
        </Field>
        <Field
          label="Maps link"
          htmlFor={`place-maps-${key}`}
          hint="Optional. Paste a Google Maps share link."
        >
          <Input
            id={`place-maps-${key}`}
            name="mapsUrl"
            type="url"
            defaultValue={place?.mapsUrl ?? ""}
            placeholder="https://maps.app.goo.gl/..."
          />
        </Field>
        <Field
          label="Note"
          htmlFor={`place-note-${key}`}
          className="sm:col-span-2"
          hint="One sentence. This is the caption on the card."
        >
          <Textarea
            id={`place-note-${key}`}
            name="note"
            rows={2}
            defaultValue={place?.note ?? ""}
          />
        </Field>
        <AssetField
          label="Photograph"
          name="imageAssetId"
          asset={assets.get(place?.imageAssetId ?? "") ?? null}
          hint="Landscape works best in the places grid."
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Checkbox
          name="status"
          label="Visible on the personal site"
          defaultChecked={place ? place.status === 1 : true}
        />
        <button
          type="submit"
          className="inline-flex h-9 items-center rounded-full bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
        >
          {place ? "Save place" : "Add place"}
        </button>
      </div>
    </form>
  );
}

export default async function PersonalPlacesPage() {
  const [places, assets] = await Promise.all([
    prisma.personalPlace.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    getAssetMap(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Personal"
        title="Places"
        description="Places you have been to: a photograph, the year, one line about it, and a map link."
      />

      <AddPanel
        title="Add a place"
        description="The grid follows this order. Use the arrows to reorder."
      >
        <PlaceForm assets={assets} />
      </AddPanel>

      {places.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line px-6 py-12 text-center text-sm text-muted">
          No places yet. Add the first one above.
        </p>
      ) : null}

      <div className="flex flex-col gap-3">
        {places.map((place, index) => (
          <details
            key={place.id}
            className="rounded-xl border border-line bg-white"
          >
            <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-5 py-4">
              <span className="flex min-w-0 items-center gap-3">
                <span className="shrink-0 font-mono text-[10px] tracking-[0.12em] text-brand uppercase">
                  {place.year || "—"}
                </span>
                <span className="truncate text-sm font-medium text-ink">
                  {place.name}
                </span>
                {place.region ? (
                  <span className="truncate text-xs text-muted">
                    {place.region}
                  </span>
                ) : null}
              </span>
              <span className="flex items-center gap-2">
                <Badge tone={place.status === 1 ? "success" : "neutral"}>
                  {place.status === 1 ? "Visible" : "Hidden"}
                </Badge>
                <Reorder
                  entity="place"
                  id={place.id}
                  path={PATH}
                  first={index === 0}
                  last={index === places.length - 1}
                />
              </span>
            </summary>

            <div className="border-t border-line/70 px-5 py-5">
              <PlaceForm place={place} assets={assets} />
              <div className="mt-5 border-t border-line/70 pt-4">
                <DeleteForm
                  action={deletePersonalPlace}
                  id={place.id}
                  path={PATH}
                  confirm={`Delete "${place.name}"?`}
                />
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
