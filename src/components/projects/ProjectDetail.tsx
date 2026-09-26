"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { EASE_STOPS, easedRange } from "@/components/ui/depth";
import type { Project } from "@/data/profile";

const DEFAULT_ACCENT = "#ff5c1a";

function monogram(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

/**
 * The scene behind a case: the project's own backdrop, dimmed at the head and
 * the foot and left almost clear through the middle, so the middle of the frame
 * is the one place the artwork is seen at full strength. Shared by the hero and
 * the closing band, so both ends of a case wear the same treatment as the wall
 * it was opened from. The oversize and the offset are there because the drift
 * would otherwise expose an edge.
 */
function Scene({
  src,
  scrim,
  drift,
  still,
}: {
  src: string;
  scrim: string;
  drift?: MotionValue<number>;
  /** `useReducedMotion` reports null until it has read the media query. */
  still: boolean | null;
}) {
  const [ready, setReady] = useState(false);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <motion.span
        style={still ? undefined : { y: drift }}
        className="absolute inset-x-0 -top-[8%] block h-[116%]"
      >
        <Image
          src={src}
          alt=""
          fill
          sizes="100vw"
          onLoad={() => setReady(true)}
          // Blurs up to sharp on decode: a full-bleed image arriving as a hard
          // rectangle reads as a strike against the words in front of it.
          className={`object-cover transition-[opacity,filter] duration-[1200ms] ease-out ${
            ready ? "opacity-80 blur-0" : "opacity-0 blur-2xl"
          }`}
        />
      </motion.span>

      <span className="absolute inset-0" style={{ backgroundImage: scrim }} />
    </div>
  );
}

/**
 * The opening, and the whole of the brief. The case is opened by its own scene
 * rather than by its artwork: the two plates belong to the wall, where they sit
 * in a slot, and standing them in the middle of a page turns them into a
 * framed picture — which is exactly what they are not.
 *
 * The head of the frame is left empty on purpose. It is the only place the
 * project's backdrop is seen without anything on it, so the copy is held down at
 * the foot and the space above it is allowed to be the picture.
 */
export function ProjectHero({
  project,
  index,
  total,
}: {
  project: Project;
  index: number;
  total: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const still = useReducedMotion();
  const accent = project.accent ?? DEFAULT_ACCENT;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // The scene lags the scroll; the opening runs slightly ahead of it. Two planes
  // is all this opening needs now that the plates are out of it.
  const sceneY = useTransform(scrollYProgress, EASE_STOPS, easedRange(0, 130));
  const openY = useTransform(scrollYProgress, EASE_STOPS, easedRange(0, -80));
  const openFade = useTransform(scrollYProgress, [0.8, 1], [1, 0]);

  return (
    <section
      ref={ref}
      style={{ "--accent": accent } as React.CSSProperties}
      className="relative isolate flex min-h-svh flex-col overflow-hidden pt-24 pb-12 sm:pt-28 sm:pb-16"
    >
      {project.sectionBackground ? (
        <Scene
          src={project.sectionBackground}
          still={still}
          drift={still ? undefined : sceneY}
          scrim="linear-gradient(to bottom, color-mix(in srgb, var(--color-black) 62%, transparent) 0%, color-mix(in srgb, var(--color-black) 28%, transparent) 20%, color-mix(in srgb, var(--color-black) 22%, transparent) 46%, color-mix(in srgb, var(--color-black) 72%, transparent) 78%, var(--color-black) 100%)"
        />
      ) : null}

      <Container className="relative z-20 flex items-center justify-between gap-6">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-white/55 uppercase transition-colors hover:text-white"
        >
          <ArrowLeft
            aria-hidden
            className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
          />
          Back to the wall
        </Link>

        <span className="font-mono text-[11px] tracking-[0.2em] text-white/35 uppercase">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </Container>

      {/* The open frame. Held at a third of a small screen so the backdrop always
          gets a clear band, and free to grow on a tall one. */}
      <div aria-hidden className="min-h-[30svh] flex-1" />

      {/* Nothing here but the mark, the name and what the thing is. The credit
          and the stack are facts about the case, not part of its opening, and
          they are set further down where a reader goes looking for them. */}
      <motion.div
        style={still ? undefined : { y: openY, opacity: openFade }}
        className="relative z-20"
      >
        <Container>
          {/* The client's mark, supplied as full-bleed artwork: no frame and no
              padding, only rounded corners. */}
          <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-2xl">
            {project.logo ? (
              <Image
                src={project.logo}
                alt=""
                fill
                sizes="48px"
                className="object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-white/10 font-mono text-[11px] tracking-wide text-white/80">
                {monogram(project.name)}
              </span>
            )}
          </span>

          <h1 className="font-display mt-6 text-[2.5rem] leading-[0.88] uppercase sm:text-[4rem] lg:text-[5rem]">
            {project.name}
          </h1>

          <span
            aria-hidden
            className="mt-6 block h-1 w-16 bg-[var(--accent)] sm:w-24"
          />

          <p className="mt-6 max-w-3xl text-base leading-relaxed text-pretty text-white/70 sm:text-lg">
            {project.summary}
          </p>
        </Container>
      </motion.div>
    </section>
  );
}

/**
 * The hand-off to the next case, wearing that project's own scene. Half a screen
 * is enough: this is a doorway, not a second landing. The band is one link, so
 * the whole surface is the target rather than just the words on it.
 */
export function ProjectNext({ project }: { project: Project }) {
  const ref = useRef<HTMLElement>(null);
  const still = useReducedMotion();
  const accent = project.accent ?? DEFAULT_ACCENT;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const sceneY = useTransform(scrollYProgress, EASE_STOPS, easedRange(-60, 60));
  const nameY = useTransform(scrollYProgress, EASE_STOPS, easedRange(28, -28));

  return (
    <section
      ref={ref}
      style={{ "--accent": accent } as React.CSSProperties}
      className="relative isolate flex min-h-[50svh] flex-col justify-end overflow-hidden"
    >
      {project.sectionBackground ? (
        <Scene
          src={project.sectionBackground}
          still={still}
          drift={still ? undefined : sceneY}
          // Solid at the head, so the band grows out of the page above it instead
          // of butting against it, then clear enough through the middle for the
          // image to read, then closed again under the words.
          scrim="linear-gradient(to bottom, var(--color-black) 0%, color-mix(in srgb, var(--color-black) 40%, transparent) 14%, color-mix(in srgb, var(--color-black) 20%, transparent) 34%, color-mix(in srgb, var(--color-black) 44%, transparent) 62%, var(--color-black) 100%)"
        />
      ) : null}

      <Container className="relative z-10 pb-14 sm:pb-20">
        <Link
          href={`/projects/${project.slug}`}
          className="group block"
          aria-label={`Next case: ${project.name}`}
        >
          <span className="font-mono text-[11px] tracking-[0.25em] text-white/45 uppercase">
            Next on the wall
          </span>

          <motion.span
            style={still ? undefined : { y: nameY }}
            className="mt-4 block"
          >
            <span className="font-display text-[1.75rem] leading-[1] uppercase transition-colors group-hover:text-[var(--accent)] sm:text-[2.5rem]">
              {project.name}
            </span>
          </motion.span>

          <span className="mt-4 block max-w-xl text-sm leading-relaxed text-white/55">
            {project.blurb}
          </span>
        </Link>
      </Container>
    </section>
  );
}
