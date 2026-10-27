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
import { deleteCompany, saveCompany } from "@/lib/actions/content";

export const dynamic = "force-dynamic";

type CompanyRecord = {
  id: string;
  slug: string;
  name: string;
  website: string | null;
  summary: string | null;
  logoAssetId: string | null;
  sortOrder: number;
  status: number;
};

function CompanyForm({
  company,
  assets,
}: {
  company?: CompanyRecord;
  assets: Map<string, AssetInfo>;
}) {
  const key = company?.id ?? "new";

  return (
    <form action={saveCompany} className="flex flex-col gap-4">
      <input type="hidden" name="_path" value="/companies" />
      {company ? <input type="hidden" name="id" value={company.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor={`company-name-${key}`}>
          <Input
            id={`company-name-${key}`}
            name="name"
            defaultValue={company?.name ?? ""}
            required
          />
        </Field>
        <Field label="Slug" htmlFor={`company-slug-${key}`}>
          <Input id={`company-slug-${key}`} name="slug" defaultValue={company?.slug ?? ""} />
        </Field>
        <Field label="Website" htmlFor={`company-website-${key}`}>
          <Input
            id={`company-website-${key}`}
            name="website"
            defaultValue={company?.website ?? ""}
          />
        </Field>
        <Field label="Sort order" htmlFor={`company-order-${key}`}>
          <Input
            id={`company-order-${key}`}
            name="sortOrder"
            type="number"
            defaultValue={company?.sortOrder ?? 0}
          />
        </Field>
        <Field label="Summary" htmlFor={`company-summary-${key}`} className="sm:col-span-2">
          <Textarea
            id={`company-summary-${key}`}
            name="summary"
            rows={3}
            defaultValue={company?.summary ?? ""}
          />
        </Field>
        <AssetField
          label="Logo"
          name="logoAssetId"
          asset={assets.get(company?.logoAssetId ?? "") ?? null}
          hint="Used by experience panels and project plates."
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Checkbox
          name="status"
          label="Active"
          defaultChecked={company ? company.status === 1 : true}
        />
        <button
          type="submit"
          className="inline-flex h-9 items-center rounded-full bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
        >
          {company ? "Save company" : "Add company"}
        </button>
      </div>
    </form>
  );
}

export default async function CompaniesPage() {
  const [companies, assets] = await Promise.all([
    prisma.company.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { experiences: true, projects: true } },
      },
    }),
    getAssetMap(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Content"
        title="Companies"
        description="Employers and clients. Their logo is what the experience rail and project plates show."
      />
      <AddPanel
        title="Add company"
        description="Employers and clients, with the mark used on the wall and experience rail."
      >
        <CompanyForm assets={assets} />
      </AddPanel>

      <div className="flex flex-col gap-3">
        {companies.map((company) => (
          <details key={company.id} className="rounded-xl border border-line bg-white">
            <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4">
              <span className="flex min-w-0 items-center gap-3">
                <span className="truncate text-sm font-medium text-ink">
                  {company.name}
                </span>
                <span className="font-mono text-[10px] tracking-[0.12em] text-muted/70 uppercase">
                  {company._count.experiences} roles · {company._count.projects} projects
                </span>
              </span>
              <Badge tone={company.status === 1 ? "success" : "neutral"}>
                {company.status === 1 ? "Active" : "Hidden"}
              </Badge>
            </summary>

            <div className="border-t border-line/70 px-5 py-5">
              <CompanyForm company={company} assets={assets} />
              <div className="mt-5 border-t border-line/70 pt-4">
                <DeleteForm
                  action={deleteCompany}
                  id={company.id}
                  path="/companies"
                  confirm={`Delete ${company.name}?`}
                />
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
