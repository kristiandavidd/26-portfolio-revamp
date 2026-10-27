import { prisma } from "@repo/db";
import {
  Badge,
  Checkbox,
  Field,
  Input,
  PageHeader,
  Textarea,
} from "@repo/ui";
import { AssetField, type AssetInfo } from "@/components/panel/AssetField";
import { DeleteForm } from "@/components/panel/FormBits";
import { AddPanel } from "@/components/panel/AddPanel";
import { getAssetMap } from "@/lib/assets";
import { deleteProduct, saveProduct } from "@/lib/actions/content";

export const dynamic = "force-dynamic";

type ProductRecord = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  accent: string | null;
  iconAssetId: string | null;
  backgroundAssetId: string | null;
  url: string | null;
  sortOrder: number;
  status: number;
};

function ProductForm({
  product,
  assets,
}: {
  product?: ProductRecord;
  assets: Map<string, AssetInfo>;
}) {
  const key = product?.id ?? "new";

  return (
    <form action={saveProduct} className="flex flex-col gap-4">
      <input type="hidden" name="_path" value="/products" />
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor={`name-${key}`}>
          <Input id={`name-${key}`} name="name" defaultValue={product?.name ?? ""} required />
        </Field>
        <Field label="Slug" htmlFor={`slug-${key}`}>
          <Input id={`slug-${key}`} name="slug" defaultValue={product?.slug ?? ""} />
        </Field>
        <Field label="Category" htmlFor={`category-${key}`}>
          <Input
            id={`category-${key}`}
            name="category"
            defaultValue={product?.category ?? ""}
          />
        </Field>
        <Field label="URL" htmlFor={`url-${key}`}>
          <Input id={`url-${key}`} name="url" defaultValue={product?.url ?? ""} />
        </Field>
        <Field
          label="Description"
          htmlFor={`description-${key}`}
          className="sm:col-span-2"
        >
          <Textarea
            id={`description-${key}`}
            name="description"
            rows={3}
            defaultValue={product?.description ?? ""}
          />
        </Field>
        <AssetField
          label="Icon"
          name="iconAssetId"
          asset={assets.get(product?.iconAssetId ?? "") ?? null}
        />
        <AssetField
          label="Background"
          name="backgroundAssetId"
          asset={assets.get(product?.backgroundAssetId ?? "") ?? null}
        />
        <Field label="Accent" htmlFor={`accent-${key}`}>
          <Input
            id={`accent-${key}`}
            name="accent"
            defaultValue={product?.accent ?? ""}
          />
        </Field>
        <Field label="Sort order" htmlFor={`order-${key}`}>
          <Input
            id={`order-${key}`}
            name="sortOrder"
            type="number"
            defaultValue={product?.sortOrder ?? 0}
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Checkbox
          name="status"
          label="Visible"
          defaultChecked={product ? product.status === 1 : true}
        />
        <button
          type="submit"
          className="inline-flex h-9 items-center rounded-full bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
        >
          {product ? "Save" : "Add product"}
        </button>
      </div>
    </form>
  );
}

export default async function ProductsPage() {
  const [products, assets] = await Promise.all([
    prisma.dephiliaProduct.findMany({ orderBy: { sortOrder: "asc" } }),
    getAssetMap(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Content"
        title="Dephilia products"
        description="The studio's own products, shown below the project wall."
      />
      <AddPanel
        title="Add product"
        description="A Dephilia product card, with its icon and backdrop uploaded in place."
      >
        <ProductForm assets={assets} />
      </AddPanel>

      <div className="flex flex-col gap-3">
        {products.map((product) => (
          <details key={product.id} className="rounded-xl border border-line bg-white">
            <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4">
              <span className="flex min-w-0 items-center gap-3">
                <span className="truncate text-sm font-medium text-ink">
                  {product.name}
                </span>
                <span className="truncate text-xs text-muted">{product.category}</span>
              </span>
              <Badge tone={product.status === 1 ? "success" : "neutral"}>
                {product.status === 1 ? "Live" : "Hidden"}
              </Badge>
            </summary>

            <div className="border-t border-line/70 px-5 py-5">
              <ProductForm product={product} assets={assets} />
              <div className="mt-5 border-t border-line/70 pt-4">
                <DeleteForm
                  action={deleteProduct}
                  id={product.id}
                  path="/products"
                  confirm={`Delete ${product.name}?`}
                />
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
