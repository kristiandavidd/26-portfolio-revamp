import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { Container } from "@repo/ui";

export default function Forbidden() {
  return (
    <main className="page-in relative isolate flex flex-1 items-center overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 55% 65% at 20% 30%, color-mix(in srgb, var(--color-violet) 20%, transparent), transparent 70%)",
        }}
      />

      <Container className="py-24 sm:py-32">
        <p className="font-mono text-[10px] tracking-[0.28em] text-violet uppercase">
          Error 403
        </p>
        <h1 className="font-display mt-5 max-w-2xl text-[clamp(2rem,8vw,5.5rem)] leading-[0.92] text-balance">
          Not a page for you.
        </h1>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-muted sm:text-base">
          You don&apos;t have access to this page. If a link brought you here, it
          probably wasn&apos;t meant to be shared.
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
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] text-ink/35 uppercase">
            <Lock size={11} aria-hidden />
            Restricted
          </span>
        </div>
      </Container>
    </main>
  );
}
