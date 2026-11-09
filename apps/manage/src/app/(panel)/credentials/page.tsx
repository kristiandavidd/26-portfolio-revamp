import Image from "next/image";
import { prisma } from "@repo/db";
import { Field, Input, PageHeader } from "@repo/ui";
import { SubmitButton } from "@/components/panel/SubmitButton";
import { AssetField, type AssetInfo } from "@/components/panel/AssetField";
import { DeleteForm } from "@/components/panel/FormBits";
import { Modal } from "@/components/panel/Modal";
import { SelectMenu } from "@/components/panel/SelectMenu";
import { EmptyRow, TableShell, Td, Th } from "@/components/panel/Table";
import { Reorder, StatusToggle } from "@/components/panel/RowActions";
import { getAssetMap } from "@/lib/assets";
import {
  deleteCertification,
  deleteCommunityRole,
  saveCertification,
  saveCommunityRole,
} from "@/lib/actions/content";

export const dynamic = "force-dynamic";

const PATH = "/credentials";
const ICONS = ["cloud", "brain", "layers", "flame"];

type CertificationRecord = {
  id: string;
  name: string;
  issuer: string;
  periodLabel: string;
  accent: string | null;
  logoAssetId: string | null;
  credentialId: string | null;
  url: string | null;
  status: number;
};

type CommunityRecord = {
  id: string;
  programme: string;
  role: string;
  periodLabel: string;
  icon: string;
  metric: string;
  metricNote: string;
  status: number;
};

function CertificationForm({
  item,
  assets,
}: {
  item?: CertificationRecord;
  assets: Map<string, AssetInfo>;
}) {
  const key = item?.id ?? "new";

  return (
    <form action={saveCertification} className="flex flex-col gap-5">
      <input type="hidden" name="_path" value={PATH} />
      {item ? <input type="hidden" name="id" value={item.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Name"
          htmlFor={`cert-name-${key}`}
          hint="Line breaks are kept on the plate."
        >
          <Input
            id={`cert-name-${key}`}
            name="name"
            defaultValue={item?.name ?? ""}
            required
          />
        </Field>
        <Field label="Issuer" htmlFor={`cert-issuer-${key}`}>
          <Input
            id={`cert-issuer-${key}`}
            name="issuer"
            defaultValue={item?.issuer ?? ""}
          />
        </Field>
        <Field label="Period" htmlFor={`cert-period-${key}`}>
          <Input
            id={`cert-period-${key}`}
            name="periodLabel"
            defaultValue={item?.periodLabel ?? ""}
            placeholder="Nov 2025 – Nov 2028"
          />
        </Field>
        <Field label="Credential ID" htmlFor={`cert-credential-${key}`}>
          <Input
            id={`cert-credential-${key}`}
            name="credentialId"
            defaultValue={item?.credentialId ?? ""}
          />
        </Field>
        <Field label="Verify URL" htmlFor={`cert-url-${key}`}>
          <Input
            id={`cert-url-${key}`}
            name="url"
            defaultValue={item?.url ?? ""}
          />
        </Field>
        <Field label="Accent" htmlFor={`cert-accent-${key}`} hint="Hex colour.">
          <Input
            id={`cert-accent-${key}`}
            name="accent"
            defaultValue={item?.accent ?? ""}
          />
        </Field>
        <AssetField
          label="Badge image"
          name="logoAssetId"
          asset={assets.get(item?.logoAssetId ?? "") ?? null}
        />
      </div>

      <div className="flex justify-end">
        <SubmitButton pendingLabel="Saving…">
          {item ? "Save credential" : "Add credential"}
        </SubmitButton>
      </div>
    </form>
  );
}

function CommunityForm({ item }: { item?: CommunityRecord }) {
  const key = item?.id ?? "new";

  return (
    <form action={saveCommunityRole} className="flex flex-col gap-5">
      <input type="hidden" name="_path" value={PATH} />
      {item ? <input type="hidden" name="id" value={item.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Programme" htmlFor={`community-programme-${key}`}>
          <Input
            id={`community-programme-${key}`}
            name="programme"
            defaultValue={item?.programme ?? ""}
            required
          />
        </Field>
        <Field label="Role" htmlFor={`community-role-${key}`}>
          <Input
            id={`community-role-${key}`}
            name="role"
            defaultValue={item?.role ?? ""}
          />
        </Field>
        <Field label="Period" htmlFor={`community-period-${key}`}>
          <Input
            id={`community-period-${key}`}
            name="periodLabel"
            defaultValue={item?.periodLabel ?? ""}
          />
        </Field>
        <Field label="Icon" htmlFor={`community-icon-${key}`}>
          <SelectMenu
            id={`community-icon-${key}`}
            name="icon"
            defaultValue={item?.icon ?? "cloud"}
            options={ICONS.map((icon) => ({ value: icon, label: icon }))}
          />
        </Field>
        <Field label="Metric" htmlFor={`community-metric-${key}`}>
          <Input
            id={`community-metric-${key}`}
            name="metric"
            defaultValue={item?.metric ?? ""}
          />
        </Field>
        <Field label="Metric note" htmlFor={`community-note-${key}`}>
          <Input
            id={`community-note-${key}`}
            name="metricNote"
            defaultValue={item?.metricNote ?? ""}
          />
        </Field>
      </div>

      <div className="flex justify-end">
        <SubmitButton pendingLabel="Saving…">
          {item ? "Save entry" : "Add entry"}
        </SubmitButton>
      </div>
    </form>
  );
}

export default async function CredentialsPage() {
  const [certifications, community, assets] = await Promise.all([
    prisma.certification.findMany({
      where: { deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    prisma.communityRole.findMany({
      where: { deletedAt: null },
      orderBy: [{ sortOrder: "asc" }],
    }),
    getAssetMap(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Professional"
        title="Credentials"
        description="Certification plates and the community work listed under them."
        actions={
          <>
            <Modal
              triggerLabel="New community entry"
              title="New community entry"
              description="One row per programme and year, with the result as the badge."
            >
              <CommunityForm />
            </Modal>
            <Modal
              triggerLabel="New certification"
              triggerVariant="primary"
              triggerSize="md"
              title="New certification"
              description="The plate and the badge are both configured here."
            >
              <CertificationForm assets={assets} />
            </Modal>
          </>
        }
      />

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold text-ink">Certifications</h2>
          <p className="mt-1 text-xs text-muted">
            Badge, issuer and verify link, shown as plates on the site.
          </p>
        </div>

        <TableShell>
          <thead>
            <tr>
              <Th className="w-12 pl-5">#</Th>
              <Th>Name</Th>
              <Th>Issuer</Th>
              <Th>Period</Th>
              <Th>Status</Th>
              <Th className="pr-5 text-right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/70">
            {certifications.length === 0 ? (
              <EmptyRow>No certifications yet.</EmptyRow>
            ) : null}

            {certifications.map((item, index) => {
              const logo = item.logoAssetId
                ? assets.get(item.logoAssetId)
                : undefined;

              return (
                <tr key={item.id}>
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
                            {item.name.replace(/\n/g, " ").slice(0, 2)}
                          </span>
                        )}
                      </span>
                      <span className="block max-w-[18rem] truncate font-medium text-ink">
                        {item.name.replace(/\n/g, " ")}
                      </span>
                    </div>
                  </Td>
                  <Td className="text-ink/75">{item.issuer || "—"}</Td>
                  <Td className="font-mono text-[11px] text-muted">
                    {item.periodLabel || "—"}
                  </Td>
                  <Td>
                    <StatusToggle
                      entity="certification"
                      id={item.id}
                      status={item.status}
                      path={PATH}
                    />
                  </Td>
                  <Td className="pr-5">
                    <div className="flex items-center justify-end gap-1.5">
                      <Reorder
                        entity="certification"
                        id={item.id}
                        path={PATH}
                        first={index === 0}
                        last={index === certifications.length - 1}
                      />
                      <Modal
                        triggerLabel="Edit"
                        title="Edit credential"
                        description={item.name.replace(/\n/g, " ")}
                      >
                        <CertificationForm item={item} assets={assets} />
                      </Modal>
                      <DeleteForm
                        action={deleteCertification}
                        id={item.id}
                        path={PATH}
                        confirm="Delete this credential?"
                      />
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </TableShell>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold text-ink">Community</h2>
          <p className="mt-1 text-xs text-muted">
            Facilitator roles and programmes shown in the passing-it-on section.
          </p>
        </div>

        <TableShell>
          <thead>
            <tr>
              <Th className="w-12 pl-5">#</Th>
              <Th>Programme</Th>
              <Th>Role</Th>
              <Th>Period</Th>
              <Th>Result</Th>
              <Th>Status</Th>
              <Th className="pr-5 text-right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/70">
            {community.length === 0 ? (
              <EmptyRow>No community entries yet.</EmptyRow>
            ) : null}

            {community.map((item, index) => (
              <tr key={item.id}>
                <Td className="pl-5 font-mono text-[10px] text-muted">
                  {String(index + 1).padStart(2, "0")}
                </Td>
                <Td className="font-medium text-ink">{item.programme}</Td>
                <Td className="text-ink/75">{item.role || "—"}</Td>
                <Td className="font-mono text-[11px] text-muted">
                  {item.periodLabel || "—"}
                </Td>
                <Td className="text-ink/75">
                  {item.metric || "—"}
                  {item.metricNote ? (
                    <span className="block text-xs text-muted">
                      {item.metricNote}
                    </span>
                  ) : null}
                </Td>
                <Td>
                  <StatusToggle
                    entity="community"
                    id={item.id}
                    status={item.status}
                    path={PATH}
                  />
                </Td>
                <Td className="pr-5">
                  <div className="flex items-center justify-end gap-1.5">
                    <Reorder
                      entity="community"
                      id={item.id}
                      path={PATH}
                      first={index === 0}
                      last={index === community.length - 1}
                    />
                    <Modal
                      triggerLabel="Edit"
                      title="Edit community entry"
                      description={item.programme}
                    >
                      <CommunityForm item={item} />
                    </Modal>
                    <DeleteForm
                      action={deleteCommunityRole}
                      id={item.id}
                      path={PATH}
                      confirm="Delete this community entry?"
                    />
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </section>
    </div>
  );
}
