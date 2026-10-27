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
import { DeleteForm } from "@/components/panel/FormBits";
import { AddPanel } from "@/components/panel/AddPanel";
import { deleteExperience, saveExperience } from "@/lib/actions/content";

export const dynamic = "force-dynamic";

type ExperienceRecord = {
  id: string;
  companyId: string;
  role: string;
  periodLabel: string;
  isCurrent: boolean;
  sortOrder: number;
  status: number;
  highlights: { content: string }[];
};

function ExperienceForm({
  item,
  companies,
}: {
  item?: ExperienceRecord;
  companies: { id: string; name: string }[];
}) {
  const key = item?.id ?? "new";

  return (
    <form action={saveExperience} className="flex flex-col gap-4">
      <input type="hidden" name="_path" value="/experience" />
      {item ? <input type="hidden" name="id" value={item.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company" htmlFor={`company-${key}`}>
          <Select
            id={`company-${key}`}
            name="companyId"
            defaultValue={item?.companyId ?? companies[0]?.id ?? ""}
            required
          >
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Role" htmlFor={`role-${key}`}>
          <Input id={`role-${key}`} name="role" defaultValue={item?.role ?? ""} required />
        </Field>
        <Field label="Period" htmlFor={`period-${key}`}>
          <Input
            id={`period-${key}`}
            name="periodLabel"
            defaultValue={item?.periodLabel ?? ""}
            placeholder="Jun 2025 – Present"
          />
        </Field>
        <Field label="Sort order" htmlFor={`order-${key}`}>
          <Input
            id={`order-${key}`}
            name="sortOrder"
            type="number"
            defaultValue={item?.sortOrder ?? 0}
          />
        </Field>
        <Field
          label="Highlights"
          htmlFor={`highlights-${key}`}
          hint="One per line."
          className="sm:col-span-2"
        >
          <Textarea
            id={`highlights-${key}`}
            name="highlights"
            rows={5}
            defaultValue={item?.highlights.map((entry) => entry.content).join("\n") ?? ""}
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-5">
          <Checkbox
            name="isCurrent"
            label="Current role"
            defaultChecked={item?.isCurrent ?? false}
          />
          <Checkbox
            name="status"
            label="Visible"
            defaultChecked={item ? item.status === 1 : true}
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-9 items-center rounded-full bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
        >
          {item ? "Save" : "Add experience"}
        </button>
      </div>
    </form>
  );
}

export default async function ExperiencePage() {
  const [items, companies] = await Promise.all([
    prisma.experience.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        company: true,
        highlights: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.company.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Content"
        title="Experience"
        description="The companies behind the journey. Logos come from the company record."
      />
      <AddPanel
        title="Add experience"
        description="The logo comes from the company record, so add the company first."
      >
        <ExperienceForm companies={companies} />
      </AddPanel>

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <details key={item.id} className="rounded-xl border border-line bg-white">
            <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4">
              <span className="flex min-w-0 items-center gap-3">
                <span className="truncate text-sm font-medium text-ink">
                  {item.company.name}
                </span>
                <span className="truncate text-xs text-muted">{item.role}</span>
              </span>
              <Badge tone={item.status === 1 ? "success" : "neutral"}>
                {item.isCurrent ? "Current" : item.status === 1 ? "Live" : "Hidden"}
              </Badge>
            </summary>

            <div className="border-t border-line/70 px-5 py-5">
              <ExperienceForm item={item} companies={companies} />
              <div className="mt-5 border-t border-line/70 pt-4">
                <DeleteForm
                  action={deleteExperience}
                  id={item.id}
                  path="/experience"
                  confirm={`Delete the ${item.company.name} entry?`}
                />
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
