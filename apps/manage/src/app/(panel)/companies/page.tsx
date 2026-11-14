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
import { deleteCompany, saveCompany } from "@/lib/actions/content";

export const dynamic = "force-dynamic";

const PATH = "/companies";

type CompanyRecord = {
  id: string;
  name: string;
  website: string | null;
  summary: string | null;
  logoAssetId: string | null;
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
    <form action={saveCompany} className="flex flex-col gap-5">
      <input type="hidden" name="_path" value={PATH} />
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
        <Field
          label="Website"
          htmlFor={`company-website-${key}`}
          hint="Optional."
        >
          <Input
            id={`company-website-${key}`}
            name="website"
            defaultValue={company?.website ?? ""}
          />
        </Field>
        <Field
          label="Summary"
          htmlFor={`company-summary-${key}`}
          className="sm:col-span-2"
        >
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

      <div className="flex justify-end">
        <SubmitButton pendingLabel="Saving…">
          {company ? "Save company" : "Add company"}
        </SubmitButton>
      </div>
    </form>
  );
}

export default async function CompaniesPage() {
  const [companies, assets] = await Promise.all([
    prisma.company.findMany({
      where: { deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: {
        _count: {
          select: {
            experiences: { where: { deletedAt: null } },
            projects: { where: { deletedAt: null } },
          },
        },
      },
    }),
    getAssetMap(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Professional"
        title="Companies"
        description="Employers and clients. Their logo is what the experience rail and project plates show."
        actions={
          <Modal
            triggerLabel="New company"
            triggerVariant="primary"
            triggerSize="md"
            title="New company"
            description="Employers and clients, with the mark used on the wall."
          >
            <CompanyForm assets={assets} />
          </Modal>
        }
      />

      <TableShell>
        <thead>
          <tr>
            <Th className="w-12 pl-5">#</Th>
            <Th>Company</Th>
            <Th>Website</Th>
            <Th>Used by</Th>
            <Th>Status</Th>
            <Th className="pr-5 text-right">Actions</Th>
          </tr>
        </thead>
        <SortableBody
          entity="company"
          ids={companies.map((company) => company.id)}
          path={PATH}
          className="divide-y divide-line/70"
        >
          {companies.length === 0 ? (
            <EmptyRow>No companies yet.</EmptyRow>
          ) : null}

          {companies.map((company, index) => {
            const logo = company.logoAssetId
              ? assets.get(company.logoAssetId)
              : undefined;

            return (
              <tr key={company.id}>
                <Td className="pl-5 font-mono text-[10px] text-muted">
                  {String(index + 1).padStart(2, "0")}
                </Td>
                <Td>
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-surface">
                      {logo ? (
                        <Image
                          src={logo.url}
                          alt=""
                          width={36}
                          height={36}
                          unoptimized
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="font-mono text-[9px] text-muted">
                          {company.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </span>
                    <span className="block truncate font-medium text-ink">
                      {company.name}
                    </span>
                  </div>
                </Td>
                <Td className="font-mono text-[11px] text-muted">
                  {company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="transition-colors hover:text-brand"
                    >
                      {company.website.replace(/^https?:\/\//, "")}
                    </a>
                  ) : (
                    "—"
                  )}
                </Td>
                <Td className="font-mono text-[10px] tracking-[0.08em] text-muted uppercase">
                  {company._count.experiences} roles · {company._count.projects}{" "}
                  projects
                </Td>
                <Td>
                  <StatusToggle
                    entity="company"
                    id={company.id}
                    status={company.status}
                    path={PATH}
                  />
                </Td>
                <Td className="pr-5">
                  <div className="flex items-center justify-end gap-1.5">
                    <Reorder
                      entity="company"
                      id={company.id}
                      path={PATH}
                      first={index === 0}
                      last={index === companies.length - 1}
                    />
                    <Modal
                      triggerLabel="Edit"
                      title="Edit company"
                      description={company.name}
                    >
                      <CompanyForm company={company} assets={assets} />
                    </Modal>
                    <DeleteForm
                      action={deleteCompany}
                      id={company.id}
                      path={PATH}
                      confirm={`Delete ${company.name}?`}
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
