import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ProjectHero, ProjectNext } from "@/components/projects/ProjectDetail";
import { profile, projects } from "@/data/profile";

type Params = { slug: string };

const DEFAULT_ACCENT = "#ff5c1a";

export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) return { title: "Project not found" };

  return {
    title: `${project.name} · ${profile.name}`,
    description: project.blurb,
    // Set per case: metadata is merged shallowly, so a page that defines
    // openGraph replaces the layout's wholesale rather than adding to it.
    openGraph: {
      title: `${project.name} · ${profile.name}`,
      description: project.blurb,
      url: `/projects/${project.slug}`,
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const index = projects.findIndex((item) => item.slug === slug);
  if (index === -1) notFound();

  const project = projects[index];
  const next = projects[(index + 1) % projects.length];
  const accent = project.accent ?? DEFAULT_ACCENT;
  const position = String(index + 1).padStart(2, "0");
  const total = String(projects.length).padStart(2, "0");

  // Clients and dates are missing for some projects, so empty rows are dropped
  // rather than rendered as a label with nothing after it.
  const facts = [
    { label: "Role", value: project.role },
    { label: "Company", value: project.company },
    { label: "When", value: project.period },
  ].filter((fact) => fact.value);

  return (
    <main
      style={{ "--accent": accent } as React.CSSProperties}
      className="page-in relative flex-1 overflow-x-clip bg-black text-white"
    >
      <ProjectHero project={project} index={index} total={projects.length} />

      {/* The case's own facts, as a strip rather than a section: role, client and
          date are what a reader checks before settling in, and the stack belongs
          alongside them. Set once on the page — the opening carries none of it. */}
      <div className="relative border-b border-white/10">
        <Container className="flex flex-col gap-10 py-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          {facts.length > 0 ? (
            <dl className="flex flex-wrap gap-x-14 gap-y-6">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="font-mono text-[10px] tracking-[0.2em] text-white/40 uppercase">
                    {fact.label}
                  </dt>
                  <dd className="mt-2 text-sm text-white/85">{fact.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <div className="lg:max-w-md">
            <h2 className="font-mono text-[10px] tracking-[0.2em] text-white/40 uppercase">
              Stack
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  className="border border-white/20 px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] text-white/65 uppercase transition-colors hover:border-[var(--accent)] hover:text-white"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </div>

      {/* The scope list, numbered and in two columns. It is the longest block on
          the page by far — thirteen lines on the busiest case — so it is set as a
          ruled index rather than as prose with bullets. */}
      <section className="relative py-20 sm:py-28">
        <Container>
          <p className="flex items-center gap-3 font-mono text-[11px] tracking-[0.22em] text-white/40 uppercase">
            <span aria-hidden className="h-px w-8 bg-[var(--accent)]" />
            What it does
          </p>

          <h2 className="font-display mt-5 max-w-2xl text-3xl leading-[1.05] text-balance uppercase sm:text-4xl">
            {project.features.length} parts, one system
          </h2>

          <ol className="mt-12 grid gap-x-14 sm:grid-cols-2">
            {project.features.map((feature, order) => (
              <li
                key={feature}
                className="flex items-baseline gap-4 border-t border-white/10 py-4"
              >
                <span className="font-mono text-[10px] tracking-[0.15em] text-[var(--accent)]">
                  {String(order + 1).padStart(2, "0")}
                </span>
                <span className="leading-relaxed text-white/75">{feature}</span>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* One last way back, for a reader who has reached the end of the list and
          is not ready to be handed to the next case yet. */}
      <div className="relative border-t border-white/10">
        <Container className="flex items-center justify-between gap-6 py-6">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-white/45 uppercase transition-colors hover:text-white"
          >
            <ArrowLeft
              aria-hidden
              className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
            />
            Back to the wall
          </Link>

          <span className="font-mono text-[11px] tracking-[0.2em] text-white/30 uppercase">
            {position} / {total}
          </span>
        </Container>
      </div>

      <ProjectNext project={next} />
    </main>
  );
}
