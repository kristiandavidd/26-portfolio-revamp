"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { projects } from "@/data/profile";

type Project = (typeof projects)[number];

const DEFAULT_ACCENT = "#ff5c1a";

function monogram(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

// Smoothstep stops, so every layer is at rest as it arrives and leaves the
// frame instead of stopping dead at the edges.
const EASE = [0, 0.15, 0.3, 0.5, 0.7, 0.85, 1];
const SMOOTH = [0, 0.061, 0.216, 0.5, 0.784, 0.939, 1];

function eased(from: number, to: number) {
  return SMOOTH.map((t) => from + (to - from) * t);
}

function ProjectScene({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const still = useReducedMotion();
  const [backdropReady, setBackdropReady] = useState(false);
  const [near, setNear] = useState(true);
  const accent = project.accent ?? DEFAULT_ACCENT;
  const flip = index % 2 === 1;

  // Scenes are tall and there are nine of them, so most are nowhere near the
  // screen at any moment. Parking the motion styles on the ones that are far
  // away keeps their layers off the compositor entirely, which is where the
  // scroll cost actually lives. It starts optimistic so the first paint is
  // never a frame at rest that then jumps once the observer reports back.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setNear(entry.isIntersecting),
      { rootMargin: "100% 0px 100% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Nothing is pinned and nothing is clipped vertically. The scene simply
  // travels the way any content does, and the depth comes from the layers
  // travelling at different rates against that shared motion. Pinning it would
  // trap one project in a viewport-high box, which reads as a container rather
  // than as depth.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Blur and opacity carry the entrance and exit, so a project eases in rather
  // than being switched on when it reaches the screen.
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.16, 0.28, 0.74, 0.92, 1],
    [0, 0.35, 1, 1, 0.35, 0]
  );
  const blur = useTransform(
    scrollYProgress,
    [0, 0.16, 0.3, 0.72, 0.92, 1],
    [18, 9, 0, 0, 9, 18]
  );
  const filter = useMotionTemplate`blur(${blur}px)`;
  const scale = useTransform(
    scrollYProgress,
    [0, 0.28, 0.74, 1],
    [1.04, 1, 1, 0.96]
  );

  // Negative to positive lags behind the scroll (reads as further away);
  // positive to negative runs ahead of it (reads as closer).
  const plateY = useTransform(scrollYProgress, EASE, eased(-55, 55));
  const textY = useTransform(scrollYProgress, EASE, eased(60, -60));

  // The slot's own backdrop is the furthest plane in the scene, so it lags the
  // scroll the way the removed ghost numeral used to. Only projects that ship
  // artwork get one; the rest stay on flat black.
  const backY = useTransform(scrollYProgress, EASE, eased(-40, 40));

  // The two artwork layers drift on one axis in the same direction, not against
  // each other: the reference point is a car window, where near things move fast
  // and far things move slow. Opposite directions read as a mechanism, not as
  // depth.
  //
  // The previous version had both layers driven linearly over one shared range,
  // which made the foreground a fixed multiple of the background: same start,
  // same stop, same moment of rest. Two identical curves with different heights
  // do not read as two planes, they read as one plane stretching. It also put
  // the one position where the layers line up at progress 0.5 — the moment the
  // scene is centred and therefore the moment being looked at — so the composite
  // artwork was exactly what you saw, and the separation only happened out in
  // the fade.
  //
  // So each plane carries a curve of its own, and the two are in register at
  // exactly one point: 0.28, the moment the scene has finished arriving and the
  // moment the composite should read as a single image. From there they separate
  // and keep separating for the rest of the transit, which is also what tells
  // their exits apart — the far plane goes on the shorter line, the near plane
  // on the longer one.
  //
  // Neither curve starts before 0.28. The arrival is the expensive window: the
  // wrapper is running a full-width blur down from 18px across the whole subtree
  // the moment the scene appears, and moving a pair of 1600px layers inside that
  // filtered subtree lands a second job on the same frames. Holding the planes
  // still until the scene has arrived costs nothing visually — at that point they
  // are composite and unreadable — and leaves the entrance to the one pass.
  const bgDrift = useTransform(
    scrollYProgress,
    [0.28, 0.6, 0.95],
    [0, -18, -34]
  );
  const fgDrift = useTransform(
    scrollYProgress,
    [0.28, 0.6, 0.95],
    [0, -50, -84]
  );

  return (
    <div
      ref={ref}
      style={{ "--accent": accent } as React.CSSProperties}
      className="relative overflow-x-clip py-24 sm:py-32"
    >
      {/* Layer 0: the slot's backdrop, on the slowest plane. Clipped to the
          slot on purpose — the blend into the neighbours is the gradients'
          job, not the image's. */}
      {project.sectionBackground ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          {/* Oversized and offset, because the drift would otherwise expose an
              edge. It blurs up to sharp on decode: a full-bleed image arriving
              as a hard rectangle reads as a strike against the copy, and the
              soft pass costs nothing while the bytes are still in flight. */}
          <motion.span
            style={still || !near ? undefined : { y: backY }}
            className="absolute inset-x-0 -top-[6%] block h-[112%]"
          >
            <Image
              src={project.sectionBackground}
              alt=""
              fill
              sizes="100vw"
              quality={72}
              onLoad={() => setBackdropReady(true)}
              className={`object-cover transition-[opacity,filter,transform] duration-[1100ms] ease-out ${
                backdropReady
                  ? "scale-100 opacity-100 blur-[0px]"
                  : "scale-105 opacity-0 blur-2xl"
              }`}
            />
          </motion.span>

          {/* One element for the whole treatment: dimmed through the middle,
              then climbing to solid black at both ends. It used to be three
              spans, and the dim was painted under the image rather than over
              it, so it never dimmed anything. Folding a flat scrim and a linear
              fade into stops on one gradient gives the same curve — the
              composite of those two is itself linear — for a third of the
              layers. The 45% is the dimming knob. */}
          <span
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to bottom, var(--color-black) 0%, color-mix(in srgb, var(--color-black) 45%, transparent) 38%, color-mix(in srgb, var(--color-black) 45%, transparent) 62%, var(--color-black) 100%)",
            }}
          />
        </div>
      ) : null}

      <motion.div
        style={still || !near ? undefined : { opacity, filter, scale }}
        className="relative"
      >
        <Container>
          <div
            className={`flex flex-col gap-12 lg:items-center lg:gap-12 ${
              flip ? "lg:flex-row-reverse" : "lg:flex-row"
            }`}
          >
            {/* Layer 3: the copy, running ahead of the scroll. Narrow enough
                that the plate gets the larger share of the width, since the
                artwork is the thing being looked at. */}
            <motion.div
              style={still ? undefined : { y: textY }}
              className="relative z-20 lg:w-[34%] lg:shrink-0"
            >
              {project.company ? (
                <p className="font-mono text-[11px] tracking-[0.2em] text-white/45 uppercase">
                  {project.company}
                </p>
              ) : null}
              <h3
                className={`font-display text-[2.5rem] leading-[0.9] text-white uppercase sm:text-[3.5rem] lg:text-[4.5rem] ${
                  project.company ? "mt-4" : ""
                }`}
              >
                {project.name}
              </h3>
              <p className="mt-5 text-sm leading-relaxed text-white/60 sm:text-base">
                {project.blurb}
              </p>

              <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2">
                {project.tags.map((tag) => (
                  <li
                    key={tag}
                    className="font-mono text-[10px] tracking-wide text-white/45 uppercase"
                  >
                    [{tag}]
                  </li>
                ))}
              </ul>

              <Link
                href={`/projects/${project.slug}`}
                className="mt-8 inline-flex items-center gap-2 border border-white/30 px-5 py-2.5 font-mono text-[11px] tracking-[0.15em] text-white uppercase transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-black"
              >
                Read the case
                <span aria-hidden>&rarr;</span>
              </Link>
            </motion.div>

            {/* Layer 2: the plate, lagging slightly behind the copy. Deliberately
                unframed and unclipped. A frame would crop the artwork, and the
                clip would turn the separation between the layers into a gap
                against a border instead of two images moving past each other. */}
            <motion.div
              style={still ? undefined : { y: plateY }}
              className="relative z-10 lg:flex-1"
            >
              <Link
                href={`/projects/${project.slug}`}
                aria-label={`${project.name} — read the case`}
                className="relative block"
              >
                {project.background ? (
                  <>
                    {/* The background is in flow, so it is what gives the pair
                        its size, and the foreground is laid over it at exactly
                        the same box. Same canvas, same scale: they are locked
                        together until the motion pulls them apart.

                        It also sits a touch out of focus behind the sharp
                        foreground. That defocus is dropped along with the motion
                        as soon as the scene is parked off screen: a filtered
                        layer is a second raster pass on top of the wrapper's own
                        blur, and keeping nine of them alive buys nothing anyone
                        can see. */}
                    <motion.span
                      aria-hidden
                      style={still || !near ? undefined : { y: bgDrift }}
                      className={near ? "block blur-[1.2px]" : "block"}
                    >
                      <Image
                        src={project.background}
                        alt=""
                        width={1600}
                        height={1200}
                        sizes="(min-width: 1024px) 64vw, 100vw"
                        className="h-auto w-full"
                      />
                    </motion.span>

                    {project.foreground ? (
                      <motion.span
                        aria-hidden
                        style={still || !near ? undefined : { y: fgDrift }}
                        className="absolute inset-0 block"
                      >
                        <Image
                          src={project.foreground}
                          alt=""
                          width={1600}
                          height={1200}
                          sizes="(min-width: 1024px) 64vw, 100vw"
                          className="h-auto w-full"
                        />
                      </motion.span>
                    ) : null}
                  </>
                ) : (
                  <>
                    <span
                      aria-hidden
                      className="absolute inset-0 opacity-[0.07]"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(45deg, var(--color-white) 0 1px, transparent 1px 12px)",
                      }}
                    />
                    {/* Only the placeholder keeps a frame. There is no artwork
                        behind it, so it has to draw its own bounds — dashed, so
                        it reads as a slot waiting for an image. */}
                    <span className="relative flex aspect-[4/3] w-full flex-col items-center justify-center gap-4 border-2 border-dashed border-white/15 bg-white/[0.03]">
                      <span className="relative flex h-20 w-20 items-center justify-center overflow-hidden border-2 border-white/25">
                        {project.logo ? (
                          <Image
                            src={project.logo}
                            alt=""
                            fill
                            sizes="80px"
                            className="object-contain p-2"
                          />
                        ) : (
                          <span className="text-2xl font-semibold tracking-wide text-white/80">
                            {monogram(project.name)}
                          </span>
                        )}
                      </span>
                      <span className="font-mono text-[10px] tracking-[0.2em] text-white/35 uppercase">
                        plate pending
                      </span>
                    </span>
                  </>
                )}
              </Link>
            </motion.div>
          </div>
        </Container>
      </motion.div>
    </div>
  );
}

export function Projects() {
  return (
    <section
      id="projects"
      className="relative scroll-mt-24 bg-black pb-16 sm:pb-24"
    >
      <Container className="relative pt-20 sm:pt-28">
        <SectionHeader
          title="Shipped, not demoed"
          description="Nine systems built end to end — loyalty, ticketing, tournaments, messaging, IoT. Nothing here was a demo."
          tone="dark"
        />
      </Container>

      <div>
        {projects.map((project, index) => (
          <ProjectScene key={project.slug} project={project} index={index} />
        ))}
      </div>
    </section>
  );
}
