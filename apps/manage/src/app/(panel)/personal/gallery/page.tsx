import Image from "next/image";
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
import {
  deletePersonalGalleryItem,
  savePersonalGalleryItem,
} from "@/lib/actions/personal";

export const dynamic = "force-dynamic";

const PATH = "/personal/gallery";

type GalleryRecord = {
  id: string;
  title: string;
  year: string;
  note: string;
  imageAssetId: string | null;
  status: number;
};

function GalleryForm({
  item,
  assets,
}: {
  item?: GalleryRecord;
  assets: Map<string, AssetInfo>;
}) {
  const key = item?.id ?? "new";

  return (
    <form action={savePersonalGalleryItem} className="flex flex-col gap-4">
      <input type="hidden" name="_path" value={PATH} />
      {item ? <input type="hidden" name="id" value={item.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Title"
          htmlFor={`gallery-title-${key}`}
          hint="Optional. Used as the caption heading and alt text."
        >
          <Input
            id={`gallery-title-${key}`}
            name="title"
            defaultValue={item?.title ?? ""}
          />
        </Field>
        <Field label="Year" htmlFor={`gallery-year-${key}`}>
          <Input
            id={`gallery-year-${key}`}
            name="year"
            defaultValue={item?.year ?? ""}
          />
        </Field>
        <Field
          label="Note"
          htmlFor={`gallery-note-${key}`}
          className="sm:col-span-2"
          hint="One sentence, shown under the photo."
        >
          <Textarea
            id={`gallery-note-${key}`}
            name="note"
            rows={2}
            defaultValue={item?.note ?? ""}
          />
        </Field>
        <AssetField
          label="Photograph"
          name="imageAssetId"
          asset={assets.get(item?.imageAssetId ?? "") ?? null}
          hint="The gallery keeps the original aspect ratio."
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Checkbox
          name="status"
          label="Visible on the personal site"
          defaultChecked={item ? item.status === 1 : true}
        />
        <button
          type="submit"
          className="inline-flex h-9 items-center rounded-full bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
        >
          {item ? "Save photo" : "Add photo"}
        </button>
      </div>
    </form>
  );
}

export default async function PersonalGalleryPage() {
  const [items, assets] = await Promise.all([
    prisma.personalGalleryItem.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    getAssetMap(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Personal"
        title="Gallery"
        description="Photographs with a year and one line. The public page packs them into a masonry wall."
      />

      <AddPanel
        title="Add a photograph"
        description="The gallery follows this order. Use the arrows to reorder."
      >
        <GalleryForm assets={assets} />
      </AddPanel>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line px-6 py-12 text-center text-sm text-muted">
          Nothing in the gallery yet. Add the first photo above.
        </p>
      ) : null}

      <div className="flex flex-col gap-3">
        {items.map((item, index) => {
          const asset = assets.get(item.imageAssetId ?? "");
          return (
            <details
              key={item.id}
              className="rounded-xl border border-line bg-white"
            >
              <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-5 py-4">
                <span className="flex min-w-0 items-center gap-3">
                  {asset ? (
                    <Image
                      src={asset.url}
                      alt=""
                      width={40}
                      height={40}
                      unoptimized
                      className="h-10 w-10 shrink-0 rounded-lg border border-line object-cover"
                    />
                  ) : (
                    <span className="h-10 w-10 shrink-0 rounded-lg border border-dashed border-line" />
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink">
                      {item.title || "Untitled photo"}
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {[item.year, item.note].filter(Boolean).join(" · ") ||
                        "No year or note yet"}
                    </span>
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <Badge tone={item.status === 1 ? "success" : "neutral"}>
                    {item.status === 1 ? "Visible" : "Hidden"}
                  </Badge>
                  <Reorder
                    entity="gallery"
                    id={item.id}
                    path={PATH}
                    first={index === 0}
                    last={index === items.length - 1}
                  />
                </span>
              </summary>

              <div className="border-t border-line/70 px-5 py-5">
                <GalleryForm item={item} assets={assets} />
                <div className="mt-5 border-t border-line/70 pt-4">
                  <DeleteForm
                    action={deletePersonalGalleryItem}
                    id={item.id}
                    path={PATH}
                    confirm="Delete this photo from the gallery?"
                  />
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
