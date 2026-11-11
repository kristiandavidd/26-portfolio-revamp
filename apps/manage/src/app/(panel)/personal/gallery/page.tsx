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
    <form action={savePersonalGalleryItem} className="flex flex-col gap-5">
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
          allowPaste
        />
      </div>

      <div className="flex justify-end">
        <SubmitButton pendingLabel="Saving…">
          {item ? "Save photo" : "Add photo"}
        </SubmitButton>
      </div>
    </form>
  );
}

export default async function PersonalGalleryPage() {
  const [items, assets] = await Promise.all([
    prisma.personalGalleryItem.findMany({
      where: { deletedAt: null },
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
        actions={
          <Modal
            triggerLabel="New photo"
            triggerVariant="primary"
            triggerSize="md"
            title="New photograph"
            description="The wall follows table order."
          >
            <GalleryForm assets={assets} />
          </Modal>
        }
      />

      <TableShell>
        <thead>
          <tr>
            <Th className="w-12 pl-5">#</Th>
            <Th>Photo</Th>
            <Th>Year</Th>
            <Th>Note</Th>
            <Th>Status</Th>
            <Th className="pr-5 text-right">Actions</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line/70">
          {items.length === 0 ? (
            <EmptyRow>Nothing in the gallery yet.</EmptyRow>
          ) : null}

          {items.map((item, index) => {
            const image = item.imageAssetId
              ? assets.get(item.imageAssetId)
              : undefined;

            return (
              <tr key={item.id}>
                <Td className="pl-5 font-mono text-[10px] text-muted">
                  {String(index + 1).padStart(2, "0")}
                </Td>
                <Td>
                  <div className="flex items-center gap-3">
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-line bg-sand">
                      {image ? (
                        <Image
                          src={image.url}
                          alt=""
                          fill
                          unoptimized
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : null}
                    </span>
                    <span className="block max-w-[16rem] truncate font-medium text-ink">
                      {item.title || "Untitled photo"}
                    </span>
                  </div>
                </Td>
                <Td className="font-mono text-[11px] text-muted">
                  {item.year || "—"}
                </Td>
                <Td className="max-w-[16rem] truncate text-xs text-muted">
                  {item.note || "—"}
                </Td>
                <Td>
                  <StatusToggle
                    entity="gallery"
                    id={item.id}
                    status={item.status}
                    path={PATH}
                  />
                </Td>
                <Td className="pr-5">
                  <div className="flex items-center justify-end gap-1.5">
                    <Reorder
                      entity="gallery"
                      id={item.id}
                      path={PATH}
                      first={index === 0}
                      last={index === items.length - 1}
                    />
                    <Modal
                      triggerLabel="Edit"
                      title="Edit photo"
                      description={item.title || "Untitled photo"}
                    >
                      <GalleryForm item={item} assets={assets} />
                    </Modal>
                    <DeleteForm
                      action={deletePersonalGalleryItem}
                      id={item.id}
                      path={PATH}
                      confirm="Delete this photo from the gallery?"
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
