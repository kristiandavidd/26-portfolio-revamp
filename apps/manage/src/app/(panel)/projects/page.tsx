import Image from "next/image";
import { prisma } from "@repo/db";
import { Button, Field, Input, PageHeader, Textarea } from "@repo/ui";
import { AssetField, type AssetInfo } from "@/components/panel/AssetField";
import { DeleteForm } from "@/components/panel/FormBits";
import { Modal } from "@/components/panel/Modal";
import { SelectMenu } from "@/components/panel/SelectMenu";
import { EmptyRow, TableShell, Td, Th } from "@/components/panel/Table";
import { Reorder, StatusToggle } from "@/components/panel/RowActions";
import { getAssetMap } from "@/lib/assets";
import { deleteProject, saveProject } from "@/lib/actions/content";

export const dynamic = "force-dynamic";

const PATH = "/projects";

type ProjectRecord = {
  id: string;
  slug: string;
  name: string;
  companyId: string | null;
  logoAssetId: string | null;
  backgroundAssetId: string | null;
  foregroundAssetId: string | null;
  sectionBackgroundAssetId: string | null;
  accent: string | null;
  blurb: string;
  summary: string;
  role: string | null;
  periodLabel: string | null;
  status: number;
  company: { name: string } | null;
  features: { content: string }[];
  tags: { tag: { name: string } }[];
};

type CompanyOption = { id: string; name: string };

function ProjectForm({
  project,
  companies,
  assets,
}: {
  project?: ProjectRecord;
  companies: CompanyOption[];
  assets: Map<string, AssetInfo>;
}) {
  const key = project?.id ?? "new";

  return (
    <form action={saveProject} className="flex flex-col gap-5">
      <input type="hidden" name="_path" value={PATH} />
      {project ? <input type="hidden" name="id" value={project.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor={`name-${key}`}>
          <Input
            id={`name-${key}`}
            name="name"
            defaultValue={project?.name ?? ""}
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
            value={project?.slug ?? "Generated on save"}
            readOnly
            disabled
          />
        </Field>
        <Field
          label="Blurb"
          htmlFor={`blurb-${key}`}
          className="sm:col-span-2"
        >
          <Textarea
            id={`blurb-${key}`}
            name="blurb"
            rows={2}
            defaultValue={project?.blurb ?? ""}
          />
        </Field>
        <Field
          label="Summary"
          htmlFor={`summary-${key}`}
          className="sm:col-span-2"
        >
          <Textarea
            id={`summary-${key}`}
            name="summary"
            rows={4}
            defaultValue={project?.summary ?? ""}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Company" htmlFor={`company-${key}`}>
          <SelectMenu
            id={`company-${key}`}
            name="companyId"
            defaultValue={project?.companyId ?? ""}
            options={[
              { value: "", label: "No company" },
              ...companies.map((company) => ({
                value: company.id,
                label: company.name,
              })),
            ]}
          />
        </Field>
        <Field label="Role" htmlFor={`role-${key}`}>
          <Input
            id={`role-${key}`}
            name="role"
            defaultValue={project?.role ?? ""}
          />
        </Field>
        <Field label="Period" htmlFor={`period-${key}`}>
          <Input
            id={`period-${key}`}
            name="periodLabel"
            defaultValue={project?.periodLabel ?? ""}
          />
        </Field>
        <Field
          label="Accent"
          htmlFor={`accent-${key}`}
          hint="Hex, e.g. #ff5c1a."
        >
          <Input
            id={`accent-${key}`}
            name="accent"
            defaultValue={project?.accent ?? ""}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AssetField
          label="Logo"
          name="logoAssetId"
          asset={assets.get(project?.logoAssetId ?? "") ?? null}
        />
        <AssetField
          label="Section background"
          name="sectionBackgroundAssetId"
          asset={assets.get(project?.sectionBackgroundAssetId ?? "") ?? null}
        />
        <AssetField
          label="Plate background"
          name="backgroundAssetId"
          asset={assets.get(project?.backgroundAssetId ?? "") ?? null}
        />
        <AssetField
          label="Plate foreground"
          name="foregroundAssetId"
          asset={assets.get(project?.foregroundAssetId ?? "") ?? null}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Tags"
          htmlFor={`tags-${key}`}
          hint="Comma separated, e.g. Next.js, TypeScript."
        >
          <Input
            id={`tags-${key}`}
            name="tags"
            defaultValue={
              project?.tags.map((entry) => entry.tag.name).join(", ") ?? ""
            }
          />
        </Field>
        <Field
          label="Features"
          htmlFor={`features-${key}`}
          hint="One per line. Shown on the case page."
          className="sm:col-span-2"
        >
          <Textarea
            id={`features-${key}`}
            name="features"
            rows={8}
            defaultValue={
              project?.features.map((feature) => feature.content).join("\n") ??
              ""
            }
          />
        </Field>
      </div>

      <div className="flex justify-end">
        <Button type="submit">
          {project ? "Save project" : "Create project"}
        </Button>
      </div>
    </form>
  );
}

export default async function ProjectsPage() {
  const [projects, companies, assets] = await Promise.all([
    prisma.project.findMany({
      where: { deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: {
        company: { select: { name: true } },
        features: { orderBy: { sortOrder: "asc" } },
        tags: { include: { tag: true } },
      },
    }),
    prisma.company.findMany({
      where: { deletedAt: null, status: 1 },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
    getAssetMap(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Professional"
        title="Projects"
        description="Everything on the project wall and its case page. Slugs are generated, never typed."
        actions={
          <Modal
            triggerLabel="New project"
            triggerVariant="primary"
            triggerSize="md"
            title="New project"
            description="Add a case to the wall. Upload artwork straight into each slot."
            wide
          >
            <ProjectForm companies={companies} assets={assets} />
          </Modal>
        }
      />

      <TableShell>
        <thead>
          <tr>
            <Th className="w-12 pl-5">#</Th>
            <Th>Project</Th>
            <Th>Company</Th>
            <Th>Role</Th>
            <Th>Status</Th>
            <Th className="pr-5 text-right">Actions</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line/70">
          {projects.length === 0 ? (
            <EmptyRow>No projects yet.</EmptyRow>
          ) : null}

          {projects.map((project, index) => {
            const logo = project.logoAssetId
              ? assets.get(project.logoAssetId)
              : undefined;

            return (
              <tr key={project.id}>
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
                          {project.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-ink">
                        {project.name}
                      </span>
                      <span className="block truncate font-mono text-[10px] text-muted">
                        /{project.slug}
                      </span>
                    </span>
                  </div>
                </Td>
                <Td className="text-ink/75">
                  {project.company?.name ?? "—"}
                </Td>
                <Td className="text-ink/75">{project.role || "—"}</Td>
                <Td>
                  <StatusToggle
                    entity="project"
                    id={project.id}
                    status={project.status}
                    path={PATH}
                  />
                </Td>
                <Td className="pr-5">
                  <div className="flex items-center justify-end gap-1.5">
                    <Reorder
                      entity="project"
                      id={project.id}
                      path={PATH}
                      first={index === 0}
                      last={index === projects.length - 1}
                    />
                    <Modal
                      triggerLabel="Edit"
                      title="Edit project"
                      description={project.name}
                      wide
                    >
                      <ProjectForm
                        project={project}
                        companies={companies}
                        assets={assets}
                      />
                    </Modal>
                    <DeleteForm
                      action={deleteProject}
                      id={project.id}
                      path={PATH}
                      confirm={`Delete ${project.name}?`}
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
