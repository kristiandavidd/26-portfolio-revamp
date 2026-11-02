import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@repo/ui";
import { PORTFOLIO_URL } from "@/lib/seo";

export default function NotFound() {
  return (
    <main className="page-in relative isolate flex flex-1 items-center overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 70% at 80% 20%, color-mix(in srgb, var(--color-violet) 26%, transparent), transparent 70%)",
        }}
      />

      <Container className="py-24 sm:py-32">
        <p className="font-mono text-[10px] tracking-[0.28em] text-violet uppercase">
          Error 404
        </p>
        <h1 className="font-display mt-5 max-w-3xl text-[clamp(2.75rem,9vw,6.5rem)] leading-[0.92] text-balance">
          This page wandered off.
        </h1>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-muted sm:text-base">
          The link may be old, or the page may have moved. The notebook is still
          here, and the work is one click away.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-violet"
          >
            Back to the notebook
            <ArrowRight
              size={15}
              aria-hidden
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
          <a
            href={PORTFOLIO_URL}
            className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase transition-colors hover:text-black"
          >
            The work &rarr;
          </a>
        </div>
      </Container>
    </main>
  );
}
