import { getPersonalSections, type PersonalSectionView } from "@repo/db";
import { Container } from "@repo/ui";

export const dynamic = "force-dynamic";

const FALLBACK_SECTIONS: PersonalSectionView[] = [
  { key: "about", title: "About", body: "" },
  { key: "now", title: "Now", body: "" },
  { key: "notes", title: "Notes", body: "" },
];

async function loadSections() {
  try {
    const sections = await getPersonalSections();
    return sections.length > 0 ? sections : FALLBACK_SECTIONS;
  } catch {
    return FALLBACK_SECTIONS;
  }
}

export default async function PersonalHome() {
  const sections = await loadSections();
  const portfolioUrl =
    process.env.NEXT_PUBLIC_PORTFOLIO_URL || "https://kristiandav.id";

  return (
    <main className="page-in flex flex-1 flex-col">
      <Container className="flex flex-1 flex-col pt-20 pb-24 sm:pt-28">
        <header className="flex items-center justify-between gap-6">
          <p className="font-mono text-[11px] tracking-[0.25em] text-muted uppercase">
            The personal side
          </p>
          <a
            href={portfolioUrl}
            className="font-mono text-[11px] tracking-[0.2em] text-ink/60 uppercase transition-colors hover:text-violet"
          >
            The work &rarr;
          </a>
        </header>

        <section className="mt-20 max-w-4xl">
          <h1 className="font-display text-[clamp(2.75rem,9vw,7rem)] leading-[0.92] text-balance">
            A different kind of page, still being written.
          </h1>

          <p className="mt-8 max-w-xl text-base leading-relaxed text-muted">
            This side of the site is its own surface: a different voice, a
            different structure, and none of the work. The content is still
            being decided, so the room below is being held open for it rather
            than filled to look finished.
          </p>
        </section>

        <section className="mt-20 flex min-h-[32vh] items-center justify-center rounded-[2rem] border border-dashed border-line">
          <p className="font-mono text-[11px] tracking-[0.3em] text-muted uppercase">
            Canvas
          </p>
        </section>

        <section className="mt-20 grid gap-4 sm:grid-cols-3">
          {sections.map((section) => (
            <article
              key={section.key}
              className="flex min-h-[16rem] flex-col justify-between border-t border-line pt-6"
            >
              <h2 className="font-display text-3xl leading-none">{section.title}</h2>
              <p className="mt-8 text-sm leading-relaxed text-muted">
                {section.body || "Still being written."}
              </p>
            </article>
          ))}
        </section>
      </Container>

      <footer className="border-t border-line">
        <Container className="flex flex-col gap-2 py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[10px] tracking-[0.22em] text-muted uppercase">
            Kristian David
          </p>
          <p className="font-mono text-[10px] tracking-[0.22em] text-muted uppercase">
            Personal · placeholder
          </p>
        </Container>
      </footer>
    </main>
  );
}
