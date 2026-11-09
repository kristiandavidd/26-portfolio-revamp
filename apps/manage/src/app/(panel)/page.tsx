import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  FolderKanban,
  Mail,
  Plus,
  Sparkles,
} from "lucide-react";
import { prisma } from "@repo/db";
import { Badge, Card } from "@repo/ui";

export const dynamic = "force-dynamic";

const DATE = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
});

async function loadOverview() {
  const [
    projectCount,
    experienceCount,
    productCount,
    newMessages,
    messageCount,
    recentMessages,
    recentProjects,
  ] = await Promise.all([
    prisma.project.count({ where: { status: 1, deletedAt: null } }),
    prisma.experience.count({ where: { status: 1, deletedAt: null } }),
    prisma.dephiliaProduct.count({ where: { status: 1, deletedAt: null } }),
    prisma.contactMessage.count({ where: { status: "new" } }),
    prisma.contactMessage.count(),
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.project.findMany({
      where: { deletedAt: null },
      orderBy: { sortOrder: "asc" },
      take: 4,
      select: { id: true, name: true, slug: true, status: true },
    }),
  ]);

  return {
    projectCount,
    experienceCount,
    productCount,
    newMessages,
    messageCount,
    recentMessages,
    recentProjects,
  };
}

export default async function DashboardPage() {
  const overview = await loadOverview();
  const portfolioUrl =
    process.env.NEXT_PUBLIC_PORTFOLIO_URL || "https://kristiandav.id";

  const stats = [
    { label: "Published projects", value: overview.projectCount },
    { label: "Experience entries", value: overview.experienceCount },
    { label: "Dephilia products", value: overview.productCount },
    {
      label: "New messages",
      value: overview.newMessages,
      accent: overview.newMessages > 0,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Brand panel: the one loud surface on the page, everything below is
          quiet, scannable data. */}
      <section className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-8 text-white sm:px-10 sm:py-10">
        <div aria-hidden className="halftone absolute inset-0 opacity-30" />
        <div
          aria-hidden
          className="absolute -top-24 -right-24 h-80 w-80 rounded-full opacity-70"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--color-brand) 50%, transparent), transparent 68%)",
          }}
        />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-[0.26em] text-brand uppercase">
              Overview
            </p>
            <h1 className="font-display mt-3 max-w-xl text-[clamp(2rem,4vw,3.25rem)] leading-[0.95] text-balance uppercase">
              Everything in one place.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/55">
              The portfolio reads straight from these records. Save something
              here and it is live on the next request.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/projects"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
            >
              <Plus size={15} aria-hidden />
              New project
            </Link>
            <a
              href={portfolioUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-white/20 px-4 text-sm text-white/80 transition-colors hover:border-white/40 hover:text-white"
            >
              View site
              <ArrowUpRight size={14} aria-hidden />
            </a>
          </div>
        </div>

        <dl className="relative mt-9 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/10 pt-6 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="font-mono text-[9px] tracking-[0.2em] text-white/35 uppercase">
                {stat.label}
              </dt>
              <dd className="mt-1.5 flex items-baseline gap-2">
                <span className="text-3xl font-semibold tracking-tight">
                  {stat.value}
                </span>
                {stat.accent ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                ) : null}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        {/* Messages */}
        <Card className="flex flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Mail size={15} className="text-brand" aria-hidden />
              Recent messages
            </h2>
            <Link
              href="/messages"
              className="font-mono text-[10px] tracking-[0.16em] text-muted uppercase transition-colors hover:text-ink"
            >
              All {overview.messageCount}
            </Link>
          </div>

          {overview.recentMessages.length === 0 ? (
            <div className="mx-5 mb-5 rounded-xl border border-dashed border-line bg-paper/60 px-5 py-8 text-center">
              <p className="text-sm font-medium text-ink">No messages yet</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Nothing in the inbox yet. Replies you send are logged here with
                their Echo delivery status.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-line/70">
              {overview.recentMessages.map((message) => (
                <li key={message.id}>
                  <Link
                    href="/messages"
                    className="flex items-start justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-paper/60"
                  >
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-ink">
                          {message.name}
                        </span>
                        <Badge
                          tone={message.status === "new" ? "accent" : "neutral"}
                        >
                          {message.status}
                        </Badge>
                      </span>
                      <span className="mt-1 block truncate text-xs text-muted">
                        {message.subject || message.message}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-[10px] text-muted/70">
                      {DATE.format(message.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Projects */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between gap-3 px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <FolderKanban size={15} className="text-brand" aria-hidden />
              Recent projects
            </h2>
            <Link
              href="/projects"
              className="font-mono text-[10px] tracking-[0.16em] text-muted uppercase transition-colors hover:text-ink"
            >
              All {overview.projectCount}
            </Link>
          </div>

          <ul className="divide-y divide-line/70">
            {overview.recentProjects.map((project) => (
              <li key={project.id}>
                <Link
                  href="/projects"
                  className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-paper/60"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink">
                      {project.name}
                    </span>
                    <span className="block truncate font-mono text-[10px] text-muted/70">
                      /{project.slug}
                    </span>
                  </span>
                  <Badge tone={project.status === 1 ? "success" : "neutral"}>
                    {project.status === 1 ? "Live" : "Hidden"}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-auto px-5 py-4 text-xs leading-relaxed text-muted">
            Artwork is uploaded straight into each slot, so there is no separate
            library to keep tidy.
          </p>
        </Card>
      </div>

      {/* Quiet shortcuts, one row. */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            href: "/profile",
            label: "Profile & artwork",
            note: "Hero, about band, footer",
            icon: Sparkles,
          },
          {
            href: "/projects",
            label: "Project wall",
            note: "Case pages and plate artwork",
            icon: FolderKanban,
          },
          {
            href: "/companies",
            label: "Companies & clients",
            note: "Logos used across the site",
            icon: Building2,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-4 rounded-2xl border border-line bg-surface px-5 py-4 transition-colors hover:border-brand/30"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Icon size={17} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-ink">
                  {item.label}
                </span>
                <span className="block truncate text-xs text-muted">
                  {item.note}
                </span>
              </span>
              <ArrowUpRight
                size={15}
                aria-hidden
                className="ml-auto text-muted/50 transition-colors group-hover:text-brand"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
