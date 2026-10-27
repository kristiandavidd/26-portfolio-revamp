import { prisma } from "@repo/db";
import {
  Badge,
  Checkbox,
  Field,
  Input,
  PageHeader,
  Select,
} from "@repo/ui";
import { AssetField, type AssetInfo } from "@/components/panel/AssetField";
import { DeleteForm } from "@/components/panel/FormBits";
import { AddPanel } from "@/components/panel/AddPanel";
import { getAssetMap } from "@/lib/assets";
import {
  deleteCertification,
  deleteCommunityRole,
  saveCertification,
  saveCommunityRole,
} from "@/lib/actions/content";

export const dynamic = "force-dynamic";

type CertificationRecord = {
  id: string;
  name: string;
  issuer: string;
  periodLabel: string;
  accent: string | null;
  logoAssetId: string | null;
  credentialId: string | null;
  url: string | null;
  sortOrder: number;
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
  sortOrder: number;
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
    <form action={saveCertification} className="flex flex-col gap-4">
      <input type="hidden" name="_path" value="/credentials" />
      {item ? <input type="hidden" name="id" value={item.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor={`cert-name-${key}`} hint="Line breaks are kept on the plate.">
          <Input
            id={`cert-name-${key}`}
            name="name"
            defaultValue={item?.name ?? ""}
            required
          />
        </Field>
        <Field label="Issuer" htmlFor={`cert-issuer-${key}`}>
          <Input id={`cert-issuer-${key}`} name="issuer" defaultValue={item?.issuer ?? ""} />
        </Field>
        <Field label="Period" htmlFor={`cert-period-${key}`}>
          <Input
            id={`cert-period-${key}`}
            name="periodLabel"
            defaultValue={item?.periodLabel ?? ""}
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
          <Input id={`cert-url-${key}`} name="url" defaultValue={item?.url ?? ""} />
        </Field>
        <Field label="Accent" htmlFor={`cert-accent-${key}`}>
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
        <Field label="Sort order" htmlFor={`cert-order-${key}`}>
          <Input
            id={`cert-order-${key}`}
            name="sortOrder"
            type="number"
            defaultValue={item?.sortOrder ?? 0}
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Checkbox
          name="status"
          label="Visible"
          defaultChecked={item ? item.status === 1 : true}
        />
        <button
          type="submit"
          className="inline-flex h-9 items-center rounded-full bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
        >
          {item ? "Save credential" : "Add credential"}
        </button>
      </div>
    </form>
  );
}

function CommunityForm({ item }: { item?: CommunityRecord }) {
  const key = item?.id ?? "new";

  return (
    <form action={saveCommunityRole} className="flex flex-col gap-4">
      <input type="hidden" name="_path" value="/credentials" />
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
          <Input id={`community-role-${key}`} name="role" defaultValue={item?.role ?? ""} />
        </Field>
        <Field label="Period" htmlFor={`community-period-${key}`}>
          <Input
            id={`community-period-${key}`}
            name="periodLabel"
            defaultValue={item?.periodLabel ?? ""}
          />
        </Field>
        <Field label="Icon" htmlFor={`community-icon-${key}`}>
          <Select
            id={`community-icon-${key}`}
            name="icon"
            defaultValue={item?.icon ?? "cloud"}
          >
            {["cloud", "brain", "layers", "flame"].map((icon) => (
              <option key={icon} value={icon}>
                {icon}
              </option>
            ))}
          </Select>
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
        <Field label="Sort order" htmlFor={`community-order-${key}`}>
          <Input
            id={`community-order-${key}`}
            name="sortOrder"
            type="number"
            defaultValue={item?.sortOrder ?? 0}
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Checkbox
          name="status"
          label="Visible"
          defaultChecked={item ? item.status === 1 : true}
        />
        <button
          type="submit"
          className="inline-flex h-9 items-center rounded-full bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
        >
          {item ? "Save entry" : "Add entry"}
        </button>
      </div>
    </form>
  );
}

export default async function CredentialsPage() {
  const [certifications, community, assets] = await Promise.all([
    prisma.certification.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.communityRole.findMany({ orderBy: { sortOrder: "asc" } }),
    getAssetMap(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Content"
        title="Credentials"
        description="Certification plates and the community work listed under them."
      />
      <AddPanel
        title="Add certification"
        description="The plate and the badge are both configured here."
      >
        <CertificationForm assets={assets} />
      </AddPanel>

      <div className="flex flex-col gap-3">
        {certifications.map((item) => (
          <details key={item.id} className="rounded-xl border border-line bg-white">
            <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4">
              <span className="flex min-w-0 items-center gap-3">
                <span className="truncate text-sm font-medium text-ink">
                  {item.name.replace(/\n/g, " ")}
                </span>
                <span className="truncate text-xs text-muted">{item.issuer}</span>
              </span>
              <Badge tone={item.status === 1 ? "success" : "neutral"}>
                {item.status === 1 ? "Live" : "Hidden"}
              </Badge>
            </summary>
            <div className="border-t border-line/70 px-5 py-5">
              <CertificationForm item={item} assets={assets} />
              <div className="mt-5 border-t border-line/70 pt-4">
                <DeleteForm
                  action={deleteCertification}
                  id={item.id}
                  path="/credentials"
                  confirm="Delete this credential?"
                />
              </div>
            </div>
          </details>
        ))}
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold tracking-tight text-ink">
          Community
        </h2>
        <p className="mt-1 text-sm text-muted">
          Facilitator roles and programmes shown in the passing-it-on section.
        </p>
      </div>

      <AddPanel
        title="Add community entry"
        description="One row per programme and year, with the result as the badge."
      >
        <CommunityForm />
      </AddPanel>

      <div className="flex flex-col gap-3">
        {community.map((item) => (
          <details key={item.id} className="rounded-xl border border-line bg-white">
            <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4">
              <span className="flex min-w-0 items-center gap-3">
                <span className="truncate text-sm font-medium text-ink">
                  {item.programme}
                </span>
                <span className="truncate text-xs text-muted">
                  {item.periodLabel}
                </span>
              </span>
              <Badge tone={item.status === 1 ? "success" : "neutral"}>
                {item.status === 1 ? "Live" : "Hidden"}
              </Badge>
            </summary>
            <div className="border-t border-line/70 px-5 py-5">
              <CommunityForm item={item} />
              <div className="mt-5 border-t border-line/70 pt-4">
                <DeleteForm
                  action={deleteCommunityRole}
                  id={item.id}
                  path="/credentials"
                  confirm="Delete this community entry?"
                />
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
