import Image from "next/image";
import { prisma } from "@repo/db";
import { Field, Input, PageHeader, Textarea } from "@repo/ui";
import { SubmitButton } from "@/components/panel/SubmitButton";
import { AssetField, type AssetInfo } from "@/components/panel/AssetField";
import { DeleteForm } from "@/components/panel/FormBits";
import { Modal } from "@/components/panel/Modal";
import { EmptyRow, TableShell, Td, Th } from "@/components/panel/Table";
import { Reorder, StatusToggle } from "@/components/panel/RowActions";
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
    <form action={savePersonalPlace} className="flex flex-col gap-5">
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
          allowPaste
        />
      </div>

      <div className="flex justify-end">
        <SubmitButton pendingLabel="Saving…">
          {place ? "Save place" : "Add place"}
        </SubmitButton>
      </div>
    </form>
  );
}

export default async function PersonalPlacesPage() {
  const [places, assets] = await Promise.all([
    prisma.personalPlace.findMany({
      where: { deletedAt: null },
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
        actions={
          <Modal
            triggerLabel="New place"
            triggerVariant="primary"
            triggerSize="md"
            title="New place"
            description="The grid follows table order."
          >
            <PlaceForm assets={assets} />
          </Modal>
        }
      />

      <TableShell>
        <thead>
          <tr>
            <Th className="w-12 pl-5">#</Th>
            <Th>Place</Th>
            <Th>Region</Th>
            <Th>Year</Th>
            <Th>Map</Th>
            <Th>Status</Th>
            <Th className="pr-5 text-right">Actions</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line/70">
          {places.length === 0 ? (
            <EmptyRow>No places yet.</EmptyRow>
          ) : null}

          {places.map((place, index) => {
            const image = place.imageAssetId
              ? assets.get(place.imageAssetId)
              : undefined;

            return (
              <tr key={place.id}>
                <Td className="pl-5 font-mono text-[10px] text-muted">
                  {String(index + 1).padStart(2, "0")}
                </Td>
                <Td>
                  <div className="flex items-center gap-3">
                    <span className="relative h-9 w-12 shrink-0 overflow-hidden rounded-lg border border-line bg-sand">
                      {image ? (
                        <Image
                          src={image.url}
                          alt=""
                          fill
                          unoptimized
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : null}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-ink">
                        {place.name}
                      </span>
                      {place.note ? (
                        <span className="block max-w-[16rem] truncate text-xs text-muted">
                          {place.note}
                        </span>
                      ) : null}
                    </span>
                  </div>
                </Td>
                <Td className="text-ink/75">{place.region || "—"}</Td>
                <Td className="font-mono text-[11px] text-muted">
                  {place.year || "—"}
                </Td>
                <Td className="font-mono text-[10px] text-muted">
                  {place.mapsUrl ? "Linked" : "—"}
                </Td>
                <Td>
                  <StatusToggle
                    entity="place"
                    id={place.id}
                    status={place.status}
                    path={PATH}
                  />
                </Td>
                <Td className="pr-5">
                  <div className="flex items-center justify-end gap-1.5">
                    <Reorder
                      entity="place"
                      id={place.id}
                      path={PATH}
                      first={index === 0}
                      last={index === places.length - 1}
                    />
                    <Modal
                      triggerLabel="Edit"
                      title="Edit place"
                      description={place.name}
                    >
                      <PlaceForm place={place} assets={assets} />
                    </Modal>
                    <DeleteForm
                      action={deletePersonalPlace}
                      id={place.id}
                      path={PATH}
                      confirm={`Delete "${place.name}"?`}
                    />
                  </div>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </TableShell>
    </div>
  );
}
