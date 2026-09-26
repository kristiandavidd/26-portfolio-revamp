"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import {
  motion,
  useAnimationControls,
  useInView,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { certifications } from "@/data/profile";
import { useDepthY, type Depth } from "@/components/ui/depth";

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

/**
 * A rosette with two ribbon tails, drawn rather than shipped so it scales with
 * the panel and takes the panel's own colour. The one piece of furniture here
 * that is unambiguously a certificate rather than a picture frame.
 */
function Seal({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 72" aria-hidden className={className}>
      <path
        d="M21 40 L13 70 L23 65 L28 40 Z"
        fill="currentColor"
        opacity="0.65"
      />
      <path
        d="M39 40 L47 70 L37 65 L32 40 Z"
        fill="currentColor"
        opacity="0.65"
      />
      <circle
        cx="30"
        cy="26"
        r="21"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle
        cx="30"
        cy="26"
        r="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.75"
      />
      {Array.from({ length: 44 }).map((_, i) => (
        <line
          key={i}
          x1="30"
          y1="5"
          x2="30"
          y2="9.5"
          stroke="currentColor"
          strokeWidth={i % 4 === 0 ? 1.2 : 0.55}
          transform={`rotate(${i * (360 / 44)} 30 26)`}
        />
      ))}
      <circle cx="30" cy="26" r="3.5" fill="currentColor" />
    </svg>
  );
}

// Where the inner frame's four corners sit, for the lozenges that punctuate it.
const FRAME_CORNERS = [
  "left-3 top-3 -translate-x-1/2 -translate-y-1/2",
  "right-3 top-3 translate-x-1/2 -translate-y-1/2",
  "bottom-3 left-3 -translate-x-1/2 translate-y-1/2",
  "right-3 bottom-3 translate-x-1/2 translate-y-1/2",
];

/**
 * One pass of the foil. Long and soft on purpose: a band crossing this slowly
 * reads as light moving over a surface, where a quick one reads as a shape
 * being slid across it. The `times` hold the peak through the middle so the
 * plate is tinted for a beat rather than flashing.
 */
function foilSweep(delay: number) {
  return {
    x: ["-125%", "125%"],
    opacity: [0, 1, 1, 0],
    transition: {
      duration: 2.6,
      delay,
      times: [0, 0.16, 0.84, 1],
      ease: "easeInOut" as const,
    },
  };
}

function Card({ item, index }: { item: Certification; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const still = useReducedMotion();
  const accent = item.accent ?? DEFAULT_ACCENT;
  const depth: Depth = index % 2 === 1 ? "foreground" : "subject";

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const drift = useDepthY(scrollYProgress, depth, 45);

  // The mark rides its own plane inside the plate, so the frame sweeps past it
  // as the section moves. The travel is kept modest on purpose: the backdrops
  // that fill their box height are already flush with the padding, so anything
  // much larger would push them past the panel and get them clipped.
  const badgeY = useDepthY(scrollYProgress, "atmosphere", 60);

  const foil = useAnimationControls();
  const arrived = useInView(ref, { margin: "-20% 0px -20% 0px" });

  // The foil runs on arrival as well as on hover — on arrival so the plate
  // catches the light as it comes into view rather than only when pointed at,
  // and offset by index so the two credentials do not fire in the same frame.
  useEffect(() => {
    if (still || !arrived) return;
    foil.start(foilSweep(index * 0.5));
  }, [still, arrived, index, foil]);

  return (
    <motion.article
      ref={ref}
      style={still ? undefined : { y: drift }}
      className="flex flex-col items-center text-center"
    >
      {/* The badge gets black around it. Against white the artwork had no edge
          to sit on: the mark and its tail simply stopped, mid-air, wherever the
          image happened to end. Black gives it a field, and the panel is the
          whole point of the section — the words below are captions for it.

          Everything drawn into the panel lives at its edges. The middle stays
          empty on purpose: the mark throws a tail, and a tail needs darkness to
          fall into, so anything placed behind it would flatten it out.

          The furniture is what makes it read as a credential rather than a
          photo in a frame: a perforated inner border like a bond is edged, a
          rosette stamped in the corner, and the validity run along the foot the
          way a document is imprinted. */}
      <div
        style={{ "--card-accent": accent } as React.CSSProperties}
        onMouseEnter={() => foil.start(foilSweep(0))}
        className="group relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-[1.75rem] bg-black"
      >
        {/* The mark goes down first, and the frame is drawn over it. That order
            is what lets the two move against each other: the mark slides on its
            own plane, and wherever it drifts across the perforated border the
            border stays unbroken on top of it, the way a frame sits in front of
            the plate mounted inside it rather than behind. */}
        {item.logo ? (
          <motion.div
            style={still ? undefined : { y: badgeY }}
            className="absolute inset-0"
          >
            <Image
              src={item.logo}
              alt={`${item.issuer} badge`}
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-contain p-5 transition-transform duration-1000 ease-out group-hover:scale-[1.03] sm:p-6"
            />
          </motion.div>
        ) : (
          <span className="relative text-4xl font-semibold tracking-tight text-white/70">
            {monogram(item.issuer)}
          </span>
        )}

        <span
          aria-hidden
          className="pointer-events-none absolute inset-3 rounded-[1rem] border border-dashed border-white/20 transition-colors duration-1000 group-hover:border-[var(--card-accent)]"
        />

        {/* Lozenges on the frame's corners, the way an ornate border is
            punctuated. They sit on the line rather than inside it, so they read
            as part of the frame rather than as four stray marks. */}
        {FRAME_CORNERS.map((corner) => (
          <span
            key={corner}
            aria-hidden
            className={`pointer-events-none absolute h-2 w-2 rotate-45 bg-white/25 transition-colors duration-1000 group-hover:bg-[var(--card-accent)] ${corner}`}
          />
        ))}

        {/* The foot of the panel falls away to black, and the imprint and the
            seal sit on that. Reserving a band for them would have taken the
            height straight out of the badge, which is the one thing here that
            has to stay big; a fade costs the artwork nothing, because the tail
            is meant to fall into darkness anyway. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_top,var(--color-black),transparent)]"
        />

        {/* The foil catch, driven from the animation controls rather than from
            `group-hover`, so it can also run on arrival. It rides above the
            badge on purpose — a wash behind the artwork would flood the tail,
            which is the one thing the panel has to protect.

            The band is broad and stops well short of the edges. A narrow one
            crossing the plate reads as a strip laid on top of the artwork; a
            broad one reads as the surface catching light. */}
        <motion.span
          aria-hidden
          initial={{ x: "-125%", opacity: 0 }}
          animate={foil}
          style={{
            backgroundImage:
              "linear-gradient(105deg, transparent 8%, color-mix(in srgb, var(--card-accent) 30%, transparent) 50%, transparent 92%)",
          }}
          className="pointer-events-none absolute inset-0"
        />

        <Seal className="pointer-events-none absolute right-6 bottom-6 h-10 w-auto text-white/25 transition-colors duration-1000 group-hover:text-white/45 sm:right-7 sm:bottom-7 sm:h-12" />

        <span className="absolute bottom-7 left-8 font-mono text-[9px] tracking-[0.28em] text-white/60 uppercase transition-colors duration-1000 group-hover:text-white/85 sm:bottom-8 sm:left-10">
          {item.period}
          {item.credentialId ? ` · ${item.credentialId}` : ""}
        </span>
      </div>

      {/* Two lines, authored as two lines in the data rather than left to the
          browser. The titles are very different lengths, so natural wrapping put
          one card on a single line and the other on two, and the pair never
          lined up. The floor is only a safety net for very narrow screens. */}
      <h3 className="font-display mt-8 min-h-[2.1em] text-[1.5rem] leading-[1.05] text-balance whitespace-pre-line text-black uppercase sm:text-[1.75rem]">
        {item.name}
      </h3>

      <p className="mt-3 font-mono text-[11px] tracking-[0.22em] text-black/45 uppercase">
        {item.issuer}
      </p>

      {item.url ? (
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer noopener"
          style={{ "--card-accent": accent } as React.CSSProperties}
          className="mt-5 inline-flex items-center gap-2 border-b border-black/25 pb-1 font-mono text-[10px] tracking-[0.2em] text-black/60 uppercase transition-colors hover:border-[var(--card-accent)] hover:text-[var(--card-accent)]"
        >
          Verify
          <span aria-hidden>&#8599;</span>
        </a>
      ) : null}
    </motion.article>
  );
}

export function Certifications() {
  if (certifications.length === 0) return null;

  // Two columns, but only once there is something to pair. A lone credential
  // takes the full width rather than sitting in half a row with a hole beside
  // it — the badge is the point of the section, so it gets the room.
  const columns =
    certifications.length > 1 ? "sm:grid-cols-2" : "sm:grid-cols-1";

  return (
    <section
      id="certifications"
      className="relative scroll-mt-24 overflow-x-clip bg-white"
    >
      <Container className="relative pt-20 pb-20 sm:pt-28 sm:pb-28">
        <SectionHeader
          align="center"
          width="wide"
          title="Certified, not claimed"
          description="Two credentials, earned rather than listed. Everything else I know is in the work."
        />

        <div
          className={`mt-14 grid grid-cols-1 gap-12 sm:mt-20 sm:gap-10 ${columns}`}
        >
          {certifications.map((item, index) => (
            <Card
              key={`${item.issuer}-${item.name}`}
              item={item}
              index={index}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
