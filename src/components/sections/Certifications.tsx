"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { certifications } from "@/data/profile";
import {
  EASE_STOPS,
  easedRange,
  useDepthX,
  useDepthY,
} from "@/components/ui/depth";

type Certification = (typeof certifications)[number];

const DEFAULT_ACCENT = "#ff5c1a";

function monogram(issuer: string) {
  return issuer
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

// A ring of ticks, drawn rather than shipped, so nothing depends on how long an
// issuer name happens to be. Sits on the atmosphere plane behind the badge.
function Seal({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden className={className}>
      <circle
        cx="60"
        cy="60"
        r="54"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle
        cx="60"
        cy="60"
        r="45"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.75"
      />
      {Array.from({ length: 48 }).map((_, i) => (
        <line
          key={i}
          x1="60"
          y1="6"
          x2="60"
          y2="13"
          stroke="currentColor"
          strokeWidth={i % 4 === 0 ? 1.6 : 0.7}
          transform={`rotate(${i * 7.5} 60 60)`}
        />
      ))}
    </svg>
  );
}

function Row({ item }: { item: Certification }) {
  const ref = useRef<HTMLDivElement>(null);
  const still = useReducedMotion();
  const accent = item.accent ?? DEFAULT_ACCENT;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Three planes in one row. The name runs against the page, so the row reads
  // as a surface being pushed past rather than a card sitting still. The
  // metadata lags, and the badge lags hardest, which is what separates them.
  const nameX = useDepthX(scrollYProgress, "foreground", 92);
  const metaY = useDepthY(scrollYProgress, "backdrop", 92);
  const badgeY = useDepthY(scrollYProgress, "atmosphere", 92);
  const badgeScale = useTransform(
    scrollYProgress,
    EASE_STOPS,
    easedRange(0.9, 1.06)
  );
  const sealTurn = useTransform(
    scrollYProgress,
    EASE_STOPS,
    easedRange(-18, 14)
  );
  const rule = useTransform(scrollYProgress, [0, 0.4], [0, 1]);

  return (
    <div
      ref={ref}
      className="group relative border-t border-black/12"
      style={{ "--row-accent": accent } as React.CSSProperties}
    >
      {/* The rule draws itself in as the row arrives, so the register fills top
          down instead of appearing fully formed. */}
      <motion.span
        aria-hidden
        style={still ? undefined : { scaleX: rule }}
        className="absolute inset-x-0 -top-px h-px origin-left bg-[var(--row-accent)]"
      />

      <div className="grid grid-cols-1 gap-8 py-10 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-12 sm:py-14">
        <motion.div
          style={still ? undefined : { x: nameX }}
          className="min-w-0"
        >
          {item.name ? (
            <h3 className="font-display text-[8.5vw] leading-[0.94] text-balance text-black uppercase sm:text-[4.6vw] lg:text-[4rem]">
              {item.name}
            </h3>
          ) : (
            <p className="font-mono text-sm tracking-[0.2em] text-black/35 uppercase">
              [ certificate title pending ]
            </p>
          )}

          <motion.p
            style={still ? undefined : { y: metaY }}
            className="mt-5 font-mono text-[11px] tracking-[0.22em] text-black/45 uppercase"
          >
            {item.issuer}
            {item.period ? ` · ${item.period}` : ""}
            {item.credentialId ? ` · ${item.credentialId}` : ""}
          </motion.p>

          {item.url ? (
            <a
              href={item.url}
              className="mt-5 inline-flex items-center gap-2 border-b border-black/25 pb-1 font-mono text-[10px] tracking-[0.2em] text-black/60 uppercase transition-colors hover:border-[var(--row-accent)] hover:text-[var(--row-accent)]"
            >
              Verify
              <span aria-hidden>&#8599;</span>
            </a>
          ) : null}
        </motion.div>

        <motion.div
          style={still ? undefined : { y: badgeY, scale: badgeScale }}
          className="justify-self-start sm:justify-self-end"
        >
          <div className="relative">
            <motion.div
              aria-hidden
              style={still ? undefined : { rotate: sealTurn }}
              className="pointer-events-none absolute -inset-6 text-[var(--row-accent)] opacity-25"
            >
              <Seal className="h-full w-full" />
            </motion.div>

            <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden border border-black/20 bg-white transition-colors duration-300 group-hover:border-[var(--row-accent)] sm:h-24 sm:w-24">
              {item.logo ? (
                <Image
                  src={item.logo}
                  alt={`${item.issuer} badge`}
                  fill
                  sizes="96px"
                  className="object-contain p-2.5"
                />
              ) : (
                <span className="text-xl font-semibold tracking-tight text-black/70">
                  {monogram(item.issuer)}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function Certifications() {
  const ref = useRef<HTMLElement>(null);
  const still = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const backdropY = useDepthY(scrollYProgress, "atmosphere", 260);

  if (certifications.length === 0) return null;

  return (
    <section
      ref={ref}
      id="certifications"
      className="relative scroll-mt-24 overflow-x-clip bg-white"
    >
      {/* Set dressing, on the slowest plane in the section. Full bleed on
          purpose: it is meant to read as a surface the content sits on, not as
          another block in the column. */}
      <motion.span
        aria-hidden
        style={still ? undefined : { y: backdropY }}
        className="font-display pointer-events-none absolute inset-x-0 top-[46%] text-center text-[26vw] leading-none whitespace-nowrap text-black/[0.035] uppercase select-none"
      >
        Paper trail
      </motion.span>

      <Container className="relative pt-20 sm:pt-28 pb-20 sm:pb-28">
        <SectionHeader
          title="Paper trail"
          description="Two credentials, on the record. The rest is in the work."
        />

        <div className="mt-14 border-b border-black/12 sm:mt-20">
          {certifications.map((item) => (
            <Row key={`${item.issuer}-${item.name}`} item={item} />
          ))}
        </div>
      </Container>
    </section>
  );
}
