import { prisma } from "@repo/db";
import {
  Badge,
  Checkbox,
  Field,
  Input,
  PageHeader,
} from "@repo/ui";
import { AddPanel } from "@/components/panel/AddPanel";
import { AssetField, type AssetInfo } from "@/components/panel/AssetField";
import { DeleteForm } from "@/components/panel/FormBits";
import {
  Reorder,
  WishlistToggle,
} from "@/components/panel/PersonalControls";
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
    <form action={savePersonalWishlistItem} className="flex flex-col gap-4">
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
        />
        <div className="flex flex-col justify-end gap-3">
          <Checkbox
            name="done"
            label="Already done"
            defaultChecked={item?.done ?? false}
          />
        </div>
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
          {item ? "Save item" : "Add item"}
        </button>
      </div>
    </form>
  );
}

export default async function PersonalWishlistPage() {
  const [items, assets] = await Promise.all([
    prisma.personalWishlistItem.findMany({
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
        description="Things you still want to do. Tick them off here and the public checklist follows."
      />

      <AddPanel
        title="Add a wishlist item"
        description="The list follows this order. Use the arrows to reorder."
        trailing={
          <Badge tone="accent">
            {done} / {items.length} done
          </Badge>
        }
      >
        <WishlistForm assets={assets} />
      </AddPanel>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line px-6 py-12 text-center text-sm text-muted">
          The wishlist is empty. Add the first thing above.
        </p>
      ) : null}

      <div className="flex flex-col gap-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="overflow-hidden rounded-xl border border-line bg-white"
          >
            <div className="flex items-center gap-3 px-5 py-4">
              <WishlistToggle id={item.id} done={item.done} path={PATH} />
              <div className="min-w-0 flex-1">
                <p
                  className={
                    item.done
                      ? "truncate text-sm font-medium text-muted line-through"
                      : "truncate text-sm font-medium text-ink"
                  }
                >
                  {item.title}
                </p>
                {item.note ? (
                  <p className="truncate text-xs text-muted">{item.note}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge tone={item.done ? "success" : "accent"}>
                  {item.done ? "Done" : "To do"}
                </Badge>
                {item.status === 0 ? <Badge tone="neutral">Hidden</Badge> : null}
                <Reorder
                  entity="wishlist"
                  id={item.id}
                  path={PATH}
                  first={index === 0}
                  last={index === items.length - 1}
                />
              </div>
            </div>

            <details className="border-t border-line/70">
              <summary className="cursor-pointer px-5 py-3 font-mono text-[10px] tracking-[0.14em] text-muted uppercase transition-colors hover:text-ink">
                Edit item
              </summary>
              <div className="px-5 pb-5">
                <WishlistForm item={item} assets={assets} />
                <div className="mt-5 border-t border-line/70 pt-4">
                  <DeleteForm
                    action={deletePersonalWishlistItem}
                    id={item.id}
                    path={PATH}
                    confirm={`Delete "${item.title}" from the wishlist?`}
                  />
                </div>
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
