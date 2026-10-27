import { prisma } from "@repo/db";
import {
  Badge,
  Checkbox,
  Field,
  Input,
  PageHeader,
  Select,
  Textarea,
} from "@repo/ui";
import { AssetField, type AssetInfo } from "@/components/panel/AssetField";
import { AddPanel } from "@/components/panel/AddPanel";
import { DeleteForm } from "@/components/panel/FormBits";
import { getAssetMap } from "@/lib/assets";
import { deleteProject, saveProject } from "@/lib/actions/content";

export const dynamic = "force-dynamic";

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
  sortOrder: number;
  status: number;
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
  return (
    <form action={saveProject} className="flex flex-col gap-5">
      <input type="hidden" name="_path" value="/projects" />
      {project ? <input type="hidden" name="id" value={project.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor={`name-${project?.id ?? "new"}`}>
          <Input
            id={`name-${project?.id ?? "new"}`}
            name="name"
            defaultValue={project?.name ?? ""}
            required
          />
        </Field>
        <Field label="Slug" htmlFor={`slug-${project?.id ?? "new"}`} hint="Used in /projects/[slug].">
          <Input
            id={`slug-${project?.id ?? "new"}`}
            name="slug"
            defaultValue={project?.slug ?? ""}
            placeholder="auto from name"
          />
        </Field>
        <Field label="Blurb" htmlFor={`blurb-${project?.id ?? "new"}`} className="sm:col-span-2">
          <Textarea
            id={`blurb-${project?.id ?? "new"}`}
            name="blurb"
            rows={2}
            defaultValue={project?.blurb ?? ""}
          />
        </Field>
        <Field label="Summary" htmlFor={`summary-${project?.id ?? "new"}`} className="sm:col-span-2">
          <Textarea
            id={`summary-${project?.id ?? "new"}`}
            name="summary"
            rows={4}
            defaultValue={project?.summary ?? ""}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Company" htmlFor={`company-${project?.id ?? "new"}`}>
          <Select
            id={`company-${project?.id ?? "new"}`}
            name="companyId"
            defaultValue={project?.companyId ?? ""}
          >
            <option value="">— none —</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Role" htmlFor={`role-${project?.id ?? "new"}`}>
          <Input
            id={`role-${project?.id ?? "new"}`}
            name="role"
            defaultValue={project?.role ?? ""}
          />
        </Field>
        <Field label="Period" htmlFor={`period-${project?.id ?? "new"}`}>
          <Input
            id={`period-${project?.id ?? "new"}`}
            name="periodLabel"
            defaultValue={project?.periodLabel ?? ""}
          />
        </Field>
        <Field label="Accent" htmlFor={`accent-${project?.id ?? "new"}`} hint="Hex, e.g. #ff5c1a.">
          <Input
            id={`accent-${project?.id ?? "new"}`}
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
          htmlFor={`tags-${project?.id ?? "new"}`}
          hint="Comma separated, e.g. Next.js, TypeScript."
        >
          <Input
            id={`tags-${project?.id ?? "new"}`}
            name="tags"
            defaultValue={project?.tags.map((entry) => entry.tag.name).join(", ") ?? ""}
          />
        </Field>
        <Field label="Sort order" htmlFor={`order-${project?.id ?? "new"}`}>
          <Input
            id={`order-${project?.id ?? "new"}`}
            name="sortOrder"
            type="number"
            defaultValue={project?.sortOrder ?? 0}
          />
        </Field>
        <Field
          label="Features"
          htmlFor={`features-${project?.id ?? "new"}`}
          hint="One per line. Shown on the case page."
          className="sm:col-span-2"
        >
          <Textarea
            id={`features-${project?.id ?? "new"}`}
            name="features"
            rows={8}
            defaultValue={project?.features.map((feature) => feature.content).join("\n") ?? ""}
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Checkbox
          name="status"
          label="Visible on the site"
          defaultChecked={project ? project.status === 1 : true}
        />
        <button
          type="submit"
          className="inline-flex h-9 items-center rounded-full bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
        >
          {project ? "Save project" : "Create project"}
        </button>
      </div>
    </form>
  );
}

export default async function ProjectsPage() {
  const [projects, companies, assets] = await Promise.all([
    prisma.project.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        features: { orderBy: { sortOrder: "asc" } },
        tags: { include: { tag: true } },
      },
    }),
    prisma.company.findMany({ where: { status: 1 }, orderBy: { sortOrder: "asc" } }),
    getAssetMap(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Content"
        title="Projects"
        description="Everything on the project wall and its case page."
      />
      <AddPanel
        title="New project"
        description="Add a case to the wall. Upload artwork straight into each slot."
        trailing={<Badge>{projects.length} total</Badge>}
      >
        <ProjectForm companies={companies} assets={assets} />
      </AddPanel>

      <div className="flex flex-col gap-3">
        {projects.map((project) => (
          <details
            key={project.id}
            className="group rounded-xl border border-line bg-white"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4">
              <span className="flex min-w-0 items-center gap-3">
                <span className="truncate text-sm font-medium text-ink">
                  {project.name}
                </span>
                <span className="font-mono text-[10px] tracking-[0.12em] text-muted/70 uppercase">
                  /{project.slug}
                </span>
              </span>
              <Badge tone={project.status === 1 ? "success" : "neutral"}>
                {project.status === 1 ? "Live" : "Hidden"}
              </Badge>
            </summary>

            <div className="border-t border-line/70 px-5 py-5">
              <ProjectForm
                project={project}
                companies={companies}
                assets={assets}
              />
              <div className="mt-5 border-t border-line/70 pt-4">
                <DeleteForm
                  action={deleteProject}
                  id={project.id}
                  path="/projects"
                  confirm={`Delete ${project.name}?`}
                />
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
