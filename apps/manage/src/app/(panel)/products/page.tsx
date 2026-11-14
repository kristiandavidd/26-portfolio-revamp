import Image from "next/image";
import { prisma } from "@repo/db";
import { Field, Input, PageHeader, Textarea } from "@repo/ui";
import { SubmitButton } from "@/components/panel/SubmitButton";
import { AssetField, type AssetInfo } from "@/components/panel/AssetField";
import { DeleteForm } from "@/components/panel/FormBits";
import { Modal } from "@/components/panel/Modal";
import { SortableBody } from "@/components/panel/Sortable";
import { EmptyRow, TableShell, Td, Th } from "@/components/panel/Table";
import { Reorder, StatusToggle } from "@/components/panel/RowActions";
import { getAssetMap } from "@/lib/assets";
import { deleteProduct, saveProduct } from "@/lib/actions/content";

export const dynamic = "force-dynamic";

const PATH = "/products";

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
    <form action={saveProduct} className="flex flex-col gap-5">
      <input type="hidden" name="_path" value={PATH} />
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor={`name-${key}`}>
          <Input
            id={`name-${key}`}
            name="name"
            defaultValue={product?.name ?? ""}
            required
          />
        </Field>
        <Field
          label="Slug"
          htmlFor={`slug-${key}`}
          hint="Generated from the name. It stays fixed after the first save."
        >
          <Input
            id={`slug-${key}`}
            value={product?.slug ?? "Generated on save"}
            readOnly
            disabled
          />
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
        <Field label="Accent" htmlFor={`accent-${key}`} hint="Hex colour.">
          <Input
            id={`accent-${key}`}
            name="accent"
            defaultValue={product?.accent ?? ""}
          />
        </Field>
      </div>

      <div className="flex justify-end">
        <SubmitButton pendingLabel="Saving…">
          {product ? "Save product" : "Add product"}
        </SubmitButton>
      </div>
    </form>
  );
}

export default async function ProductsPage() {
  const [products, assets] = await Promise.all([
    prisma.dephiliaProduct.findMany({
      where: { deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    getAssetMap(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Professional"
        title="Dephilia products"
        description="The studio's own products, shown below the project wall."
        actions={
          <Modal
            triggerLabel="New product"
            triggerVariant="primary"
            triggerSize="md"
            title="New product"
            description="A Dephilia product card, with its icon and backdrop uploaded in place."
          >
            <ProductForm assets={assets} />
          </Modal>
        }
      />

      <TableShell>
        <thead>
          <tr>
            <Th className="w-12 pl-5">#</Th>
            <Th>Product</Th>
            <Th>Category</Th>
            <Th>Link</Th>
            <Th>Status</Th>
            <Th className="pr-5 text-right">Actions</Th>
          </tr>
        </thead>
        <SortableBody
          entity="product"
          ids={products.map((product) => product.id)}
          path={PATH}
          className="divide-y divide-line/70"
        >
          {products.length === 0 ? (
            <EmptyRow>No products yet.</EmptyRow>
          ) : null}

          {products.map((product, index) => {
            const icon = product.iconAssetId
              ? assets.get(product.iconAssetId)
              : undefined;

            return (
              <tr key={product.id}>
                <Td className="pl-5 font-mono text-[10px] text-muted">
                  {String(index + 1).padStart(2, "0")}
                </Td>
                <Td>
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-surface">
                      {icon ? (
                        <Image
                          src={icon.url}
                          alt=""
                          width={36}
                          height={36}
                          unoptimized
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="font-mono text-[9px] text-muted">
                          {product.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-ink">
                        {product.name}
                      </span>
                      <span className="block truncate font-mono text-[10px] text-muted">
                        /{product.slug}
                      </span>
                    </span>
                  </div>
                </Td>
                <Td className="text-ink/75">{product.category || "—"}</Td>
                <Td className="font-mono text-[11px] text-muted">
                  {product.url ? (
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noreferrer"
                      className="transition-colors hover:text-brand"
                    >
                      {product.url.replace(/^https?:\/\//, "")}
                    </a>
                  ) : (
                    "—"
                  )}
                </Td>
                <Td>
                  <StatusToggle
                    entity="product"
                    id={product.id}
                    status={product.status}
                    path={PATH}
                  />
                </Td>
                <Td className="pr-5">
                  <div className="flex items-center justify-end gap-1.5">
                    <Reorder
                      entity="product"
                      id={product.id}
                      path={PATH}
                      first={index === 0}
                      last={index === products.length - 1}
                    />
                    <Modal
                      triggerLabel="Edit"
                      title="Edit product"
                      description={product.name}
                    >
                      <ProductForm product={product} assets={assets} />
                    </Modal>
                    <DeleteForm
                      action={deleteProduct}
                      id={product.id}
                      path={PATH}
                      confirm={`Delete ${product.name}?`}
                    />
                  </div>
                </Td>
              </tr>
            );
          })}
        </SortableBody>
      </TableShell>
    </div>
  );
}
