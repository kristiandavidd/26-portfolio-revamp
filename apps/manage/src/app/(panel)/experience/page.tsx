import Image from "next/image";
import { prisma } from "@repo/db";
import { Field, Input, PageHeader, Textarea } from "@repo/ui";
import { SubmitButton } from "@/components/panel/SubmitButton";
import { DeleteForm } from "@/components/panel/FormBits";
import { Modal } from "@/components/panel/Modal";
import { SelectMenu } from "@/components/panel/SelectMenu";
import { SortableBody } from "@/components/panel/Sortable";
import { Switch } from "@/components/panel/Switch";
import { EmptyRow, TableShell, Td, Th } from "@/components/panel/Table";
import { Reorder, StatusToggle } from "@/components/panel/RowActions";
import { deleteExperience, saveExperience } from "@/lib/actions/content";

export const dynamic = "force-dynamic";

const PATH = "/experience";

type ExperienceRecord = {
  id: string;
  companyId: string;
  role: string;
  periodLabel: string;
  isCurrent: boolean;
  status: number;
  company: { name: string; logo: { url: string } | null };
  highlights: { content: string }[];
};

type CompanyOption = { id: string; name: string };

function ExperienceForm({
  item,
  companies,
}: {
  item?: ExperienceRecord;
  companies: CompanyOption[];
}) {
  const key = item?.id ?? "new";

  return (
    <form action={saveExperience} className="flex flex-col gap-5">
      <input type="hidden" name="_path" value={PATH} />
      {item ? <input type="hidden" name="id" value={item.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company" htmlFor={`company-${key}`}>
          <SelectMenu
            id={`company-${key}`}
            name="companyId"
            defaultValue={item?.companyId ?? companies[0]?.id ?? ""}
            options={companies.map((company) => ({
              value: company.id,
              label: company.name,
            }))}
            placeholder="Pick a company"
          />
        </Field>
        <Field label="Role" htmlFor={`role-${key}`}>
          <Input
            id={`role-${key}`}
            name="role"
            defaultValue={item?.role ?? ""}
            required
          />
        </Field>
        <Field label="Period" htmlFor={`period-${key}`}>
          <Input
            id={`period-${key}`}
            name="periodLabel"
            defaultValue={item?.periodLabel ?? ""}
            placeholder="Jun 2025 – Present"
          />
        </Field>
        <div className="flex items-end pb-1">
          <Switch
            name="isCurrent"
            label="Current role"
            defaultChecked={item?.isCurrent ?? false}
          />
        </div>
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
            defaultValue={
              item?.highlights.map((entry) => entry.content).join("\n") ?? ""
            }
          />
        </Field>
      </div>

      <div className="flex justify-end">
        <SubmitButton pendingLabel="Saving…">
          {item ? "Save experience" : "Add experience"}
        </SubmitButton>
      </div>
    </form>
  );
}

export default async function ExperiencePage() {
  const [items, companies] = await Promise.all([
    prisma.experience.findMany({
      where: { deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: {
        company: { include: { logo: { select: { url: true } } } },
        highlights: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.company.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Professional"
        title="Experience"
        description="The companies behind the journey. Logos come from the company record, so add the company first."
        actions={
          <Modal
            triggerLabel="New experience"
            triggerVariant="primary"
            triggerSize="md"
            title="New experience"
            description="The logo comes from the company record."
          >
            <ExperienceForm companies={companies} />
          </Modal>
        }
      />

      <TableShell>
        <thead>
          <tr>
            <Th className="w-12 pl-5">#</Th>
            <Th>Company</Th>
            <Th>Role</Th>
            <Th>Period</Th>
            <Th>Status</Th>
            <Th className="pr-5 text-right">Actions</Th>
          </tr>
        </thead>
        <SortableBody
          entity="experience"
          ids={items.map((item) => item.id)}
          path={PATH}
          className="divide-y divide-line/70"
        >
          {items.length === 0 ? (
            <EmptyRow>No experience entries yet.</EmptyRow>
          ) : null}

          {items.map((item, index) => (
            <tr key={item.id}>
              <Td className="pl-5 font-mono text-[10px] text-muted">
                {String(index + 1).padStart(2, "0")}
              </Td>
              <Td>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-surface">
                    {item.company.logo?.url ? (
                      <Image
                        src={item.company.logo.url}
                        alt=""
                        width={36}
                        height={36}
                        unoptimized
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="font-mono text-[9px] text-muted">
                        {item.company.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-ink">
                      {item.company.name}
                    </span>
                    {item.isCurrent ? (
                      <span className="font-mono text-[9px] tracking-[0.12em] text-brand uppercase">
                        Current
                      </span>
                    ) : null}
                  </span>
                </div>
              </Td>
              <Td className="text-ink/75">{item.role}</Td>
              <Td className="font-mono text-[11px] text-muted">
                {item.periodLabel || "—"}
              </Td>
              <Td>
                <StatusToggle
                  entity="experience"
                  id={item.id}
                  status={item.status}
                  path={PATH}
                />
              </Td>
              <Td className="pr-5">
                <div className="flex items-center justify-end gap-1.5">
                  <Reorder
                    entity="experience"
                    id={item.id}
                    path={PATH}
                    first={index === 0}
                    last={index === items.length - 1}
                  />
                  <Modal
                    triggerLabel="Edit"
                    title="Edit experience"
                    description={`${item.company.name} · ${item.role}`}
                  >
                    <ExperienceForm item={item} companies={companies} />
                  </Modal>
                  <DeleteForm
                    action={deleteExperience}
                    id={item.id}
                    path={PATH}
                    confirm={`Delete the ${item.company.name} entry?`}
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
