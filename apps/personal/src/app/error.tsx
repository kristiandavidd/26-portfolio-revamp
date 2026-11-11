"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, RotateCw } from "lucide-react";
import { Container } from "@repo/ui";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="page-in relative isolate flex flex-1 items-center overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 55% 70% at 70% 60%, color-mix(in srgb, var(--color-violet) 18%, transparent), transparent 70%)",
        }}
      />

      <Container className="py-24 sm:py-32">
        <p className="font-mono text-[10px] tracking-[0.28em] text-violet uppercase">
          Error 500
        </p>
        <h1 className="font-display mt-5 max-w-2xl text-[clamp(2.75rem,9vw,6.5rem)] leading-[0.92] text-balance">
          This page didn&apos;t load.
        </h1>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-muted sm:text-base">
          Something failed while rendering. Trying again usually fixes it — the
          notebook is still one click away.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <button
            type="button"
            onClick={() => retry()}
            className="group inline-flex items-center gap-2 rounded-full bg-violet px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-violet-dark"
          >
            <RotateCw
              size={14}
              aria-hidden
              className="transition-transform group-hover:-rotate-45"
            />
            Try again
          </button>
          <Link
            href="/"
            className="group inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-muted uppercase transition-colors hover:text-ink"
          >
            Back to the notebook
            <ArrowRight
              size={13}
              aria-hidden
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        {error.digest ? (
          <p className="mt-16 font-mono text-[10px] tracking-[0.18em] text-ink/30 uppercase">
            Reference {error.digest}
          </p>
        ) : null}
      </Container>
    </main>
  );
}
