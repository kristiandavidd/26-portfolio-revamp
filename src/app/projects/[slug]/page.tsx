import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { profile, projects } from "@/data/profile";

type Params = { slug: string };

const DEFAULT_ACCENT = "#ff5c1a";

function monogram(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

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

  // Clients and dates are missing for some projects, so empty rows are dropped
  // rather than rendered as a label with nothing after it.
  const facts = [
    { label: "Role", value: project.role },
    { label: "Company", value: project.company },
    { label: "When", value: project.period },
  ].filter((fact) => fact.value);

  return (
    <main className="relative flex-1 overflow-hidden bg-black text-white">
      {/* Same hatch as the work wall, so the page reads as part of it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, var(--color-white) 0 1px, transparent 1px 10px)",
        }}
      />

      <div
        aria-hidden
        className="relative h-1.5 w-full"
        style={{ backgroundColor: accent }}
      />

      <Container className="relative py-16 sm:py-24">
        <Link
          href="/#projects"
          className="group inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-white/50 uppercase transition-colors hover:text-white"
        >
          <ArrowLeft
            aria-hidden
            className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
          />
          Back to the wall
        </Link>

        <header className="mt-12 sm:mt-16">
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden border-2 bg-black sm:h-20 sm:w-20">
              <span
                aria-hidden
                className="absolute inset-0"
                style={{ backgroundColor: `${accent}2e` }}
              />
              {project.logo ? (
                <Image
                  src={project.logo}
                  alt={`${project.name} logo`}
                  fill
                  sizes="80px"
                  className="relative object-contain p-3"
                />
              ) : (
                <span className="relative text-xl font-semibold tracking-wide sm:text-2xl">
                  {monogram(project.name)}
                </span>
              )}
            </div>

            <div className="pt-1 font-mono text-[11px] leading-relaxed tracking-[0.15em] text-white/50 uppercase">
              {project.company ? <p>{project.company}</p> : null}
              {project.period ? <p>{project.period}</p> : null}
            </div>
          </div>

          <h1 className="font-display mt-8 text-[2.75rem] leading-[0.88] uppercase sm:text-[4.5rem] lg:text-[6rem]">
            {project.name}
          </h1>

          <svg
            viewBox="0 0 120 8"
            preserveAspectRatio="none"
            aria-hidden
            className="mt-6 h-3 w-48 sm:w-72"
            style={{ color: accent }}
          >
            <path
              d="M1 5.5C20 1.5 40 7 60 3.5C80 0 100 5.5 119 2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </header>

        <div className="mt-14 grid gap-12 sm:mt-20 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-16">
          {/* Paper panel, same stock as the wall stickers. */}
          <div
            className="bg-[#efebe2] p-6 text-black shadow-[12px_12px_0_var(--accent)] sm:p-10"
            style={{ "--accent": accent } as React.CSSProperties}
          >
            <p className="text-lg leading-relaxed text-pretty sm:text-xl">
              {project.summary}
            </p>

            <h2 className="mt-12 font-mono text-[11px] tracking-[0.2em] text-black/45 uppercase">
              What it does
            </h2>
            <ul className="mt-6 space-y-4">
              {project.features.map((feature) => (
                <li key={feature} className="flex gap-3.5">
                  <span
                    aria-hidden
                    className="mt-2.5 h-1.5 w-1.5 shrink-0"
                    style={{ backgroundColor: accent }}
                  />
                  <span className="leading-relaxed text-black/75">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <h2 className="mt-12 font-mono text-[11px] tracking-[0.2em] text-black/45 uppercase">
              Stack
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  className="border border-black/50 px-2.5 py-1 font-mono text-[10px] tracking-wide uppercase"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>

          <aside>
            <dl className="border-t border-white/15">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="flex items-baseline justify-between gap-6 border-b border-white/15 py-4"
                >
                  <dt className="font-mono text-[10px] tracking-[0.2em] text-white/40 uppercase">
                    {fact.label}
                  </dt>
                  <dd className="text-right text-sm text-white/85">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-8 font-mono text-[11px] leading-relaxed text-white/40">
              {String(index + 1).padStart(2, "0")} of{" "}
              {String(projects.length).padStart(2, "0")} on the wall.
            </p>
          </aside>
        </div>

        <nav className="mt-20 border-t border-white/15 pt-8 sm:mt-28">
          <Link
            href={`/projects/${next.slug}`}
            className="group block"
            style={
              {
                "--next-accent": next.accent ?? DEFAULT_ACCENT,
              } as React.CSSProperties
            }
          >
            <span className="font-mono text-[11px] tracking-[0.2em] text-white/40 uppercase">
              Next on the wall
            </span>
            <span className="font-display mt-4 flex flex-wrap items-center gap-4 text-[2rem] leading-none uppercase transition-colors group-hover:text-[var(--next-accent)] sm:text-[3.5rem]">
              {next.name}
              <span aria-hidden>&rarr;</span>
            </span>
          </Link>
        </nav>
      </Container>
    </main>
  );
}
