import { prisma } from "@repo/db";
import { Field, Input, PageHeader } from "@repo/ui";
import { SubmitButton } from "@/components/panel/SubmitButton";
import { AssetField, type AssetInfo } from "@/components/panel/AssetField";
import { DeleteForm } from "@/components/panel/FormBits";
import { Modal } from "@/components/panel/Modal";
import { SortableBody } from "@/components/panel/Sortable";
import { Switch } from "@/components/panel/Switch";
import { EmptyRow, TableShell, Td, Th } from "@/components/panel/Table";
import {
  Reorder,
  StatusToggle,
  WishlistToggle,
} from "@/components/panel/RowActions";
import { getAssetMap } from "@/lib/assets";
import {
  deletePersonalWishlistItem,
  savePersonalWishlistItem,
} from "@/lib/actions/personal";

export const dynamic = "force-dynamic";

const PATH = "/personal/wishlist";

type WishRecord = {
  id: string;
  title: string;
  note: string;
  imageAssetId: string | null;
  done: boolean;
  status: number;
};

function WishlistForm({
  item,
  assets,
}: {
  item?: WishRecord;
  assets: Map<string, AssetInfo>;
}) {
  const key = item?.id ?? "new";

  return (
    <form action={savePersonalWishlistItem} className="flex flex-col gap-5">
      <input type="hidden" name="_path" value={PATH} />
      {item ? <input type="hidden" name="id" value={item.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" htmlFor={`wish-title-${key}`}>
          <Input
            id={`wish-title-${key}`}
            name="title"
            defaultValue={item?.title ?? ""}
            required
          />
        </Field>
        <Field
          label="Note"
          htmlFor={`wish-note-${key}`}
          hint="Optional, one line. Shown under the title."
        >
          <Input
            id={`wish-note-${key}`}
            name="note"
            defaultValue={item?.note ?? ""}
          />
        </Field>
        <AssetField
          label="Image"
          name="imageAssetId"
          asset={assets.get(item?.imageAssetId ?? "") ?? null}
          hint="Optional. Without one, the site shows a placeholder tile."
          allowPaste
        />
        <div className="flex items-end pb-1">
          <Switch
            name="done"
            label="Already done"
            defaultChecked={item?.done ?? false}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <SubmitButton pendingLabel="Saving…">
          {item ? "Save item" : "Add item"}
        </SubmitButton>
      </div>
    </form>
  );
}

export default async function PersonalWishlistPage() {
  const [items, assets] = await Promise.all([
    prisma.personalWishlistItem.findMany({
      where: { deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    getAssetMap(),
  ]);

  const done = items.filter((item) => item.done).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Personal"
        title="Wishlist"
        description={`Things you still want to do — ${done} of ${items.length} ticked off.`}
        actions={
          <Modal
            triggerLabel="New wishlist item"
            triggerVariant="primary"
            triggerSize="md"
            title="New wishlist item"
            description="The list follows table order."
          >
            <WishlistForm assets={assets} />
          </Modal>
        }
      />

      <TableShell>
        <thead>
          <tr>
            <Th className="w-12 pl-5">#</Th>
            <Th className="w-12">Done</Th>
            <Th>Title</Th>
            <Th>Note</Th>
            <Th>Status</Th>
            <Th className="pr-5 text-right">Actions</Th>
          </tr>
        </thead>
        <SortableBody
          entity="wishlist"
          ids={items.map((item) => item.id)}
          path={PATH}
          className="divide-y divide-line/70"
        >
          {items.length === 0 ? (
            <EmptyRow>The wishlist is empty.</EmptyRow>
          ) : null}

          {items.map((item, index) => (
            <tr key={item.id}>
              <Td className="pl-5 font-mono text-[10px] text-muted">
                {String(index + 1).padStart(2, "0")}
              </Td>
              <Td>
                <WishlistToggle id={item.id} done={item.done} path={PATH} />
              </Td>
              <Td>
                <span
                  className={
                    item.done
                      ? "font-medium text-muted line-through"
                      : "font-medium text-ink"
                  }
                >
                  {item.title}
                </span>
              </Td>
              <Td className="max-w-[18rem] truncate text-xs text-muted">
                {item.note || "—"}
              </Td>
              <Td>
                <StatusToggle
                  entity="wishlist"
                  id={item.id}
                  status={item.status}
                  path={PATH}
                />
              </Td>
              <Td className="pr-5">
                <div className="flex items-center justify-end gap-1.5">
                  <Reorder
                    entity="wishlist"
                    id={item.id}
                    path={PATH}
                    first={index === 0}
                    last={index === items.length - 1}
                  />
                  <Modal
                    triggerLabel="Edit"
                    title="Edit wishlist item"
                    description={item.title}
                  >
                    <WishlistForm item={item} assets={assets} />
                  </Modal>
                  <DeleteForm
                    action={deletePersonalWishlistItem}
                    id={item.id}
                    path={PATH}
                    confirm={`Delete "${item.title}" from the wishlist?`}
                  />
                </div>
              </Td>
            </tr>
          ))}
        </SortableBody>
      </TableShell>
    </div>
  );
}
