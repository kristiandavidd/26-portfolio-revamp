import { Container } from "@repo/ui";

export function SiteFooter({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const portfolioUrl =
    process.env.NEXT_PUBLIC_PORTFOLIO_URL || "https://kristiandav.id";

  return (
    <footer className="mt-auto border-t border-line">
      <Container className="flex flex-col gap-6 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-3xl leading-none">
            {name || "The personal side"}
          </p>
          <p className="mt-2 font-mono text-[10px] tracking-[0.22em] text-muted uppercase">
            Personal notebook
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <a
            href={portfolioUrl}
            className="font-mono text-[10px] tracking-[0.18em] text-black/55 uppercase transition-colors hover:text-violet"
          >
            The work &rarr;
          </a>
          {email ? (
            <a
              href={`mailto:${email}`}
              className="font-mono text-[10px] tracking-[0.18em] text-black/55 uppercase transition-colors hover:text-violet"
            >
              Email
            </a>
          ) : null}
        </div>
      </Container>
    </footer>
  );
}
