"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useInView,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { Container, SectionHeader } from "@repo/ui";
import type { ExperienceView } from "@repo/db";

// offsetLeft and scrollWidth round to whole pixels, which leaves the rail a
// fraction short and clips the last panel. Reading the live transform back out
// lets us use the fractional rect instead.
function readTranslateX(element: HTMLElement) {
  const transform = getComputedStyle(element).transform;
  if (!transform || transform === "none") return 0;
  return new DOMMatrixReadOnly(transform).m41;
}

/**
 * One panel: the client's mark, the company, the role, and what was done there.
 *
 * Which panel is "current" is answered two ways, because the section behaves two
 * ways. Along the rail the panels are laid out sideways and share every row, so
 * visibility cannot tell them apart — the scrubbed progress does, and it is
 * passed in. Stacked on a phone each panel has a band of the page to itself, so
 * it answers for itself.
 *
 * The panel in hand takes a wash of accent; the rest sit back at a third of
 * their weight, so the section reads as one company at a time instead of three
 * at once.
 */
function Panel({
  item,
  index,
  scrubbing,
  active,
}: {
  item: ExperienceView;
  index: number;
  scrubbing: boolean;
  active: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });
  const lit = scrubbing ? index === active : inView;

  return (
    <article
      ref={ref}
      className={`relative rounded-3xl p-5 transition-opacity duration-500 sm:p-7 lg:w-[52vw] lg:shrink-0 lg:snap-start ${lit ? "opacity-100" : "opacity-35"
        }`}
    >
      {/* The wash marks the panel in hand. It is sized to the panel's own padding
          box rather than run to the section edge, so the block has room around the
          words and rounded corners; hard against the edge it read as a stray
          rectangle instead of a light. */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-r from-orange/10 to-transparent transition-opacity duration-500 ${lit ? "opacity-100" : "opacity-0"
          }`}
      />

      <div className="relative flex items-start gap-4 sm:gap-6">
        {/* No frame and no padding: these marks are supplied as full-bleed
            artwork, so the tile only rounds the corners. */}
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl sm:h-20 sm:w-20">
          {item.logo ? (
            <Image
              src={item.logo}
              alt={`${item.company} logo`}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : null}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {item.current ? (
              <span className="rounded-full border border-orange/40 bg-orange/10 px-2.5 py-0.5 font-mono text-[11px] tracking-wide text-orange uppercase">
                Current
              </span>
            ) : null}
            <span className="font-mono text-xs text-white/40">
              {item.period}
            </span>
          </div>

          <h3 className="mt-3 text-3xl text-balance text-white sm:text-4xl lg:text-5xl font-display tracking-widest uppercase">
            {item.company}
          </h3>
          <p className="mt-2 text-base text-orange sm:text-lg">{item.role}</p>
        </div>
      </div>

      <ul className="relative mt-8 space-y-3.5 sm:mt-10">
        {item.highlights.map((highlight) => (
          <li key={highlight} className="flex gap-3">
            <span
              aria-hidden
              className="mt-2 h-1 w-1 shrink-0 rounded-full bg-orange/70"
            />
            <span className="text-sm leading-relaxed text-white/60">
              {highlight}
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function Experience({ items }: { items: ExperienceView[] }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const shiftRef = useRef(0);
  const [scrubbing, setScrubbing] = useState(false);
  const [active, setActive] = useState(0);

  const LAST = Math.max(items.length - 1, 1);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  // Reads shiftRef on every frame instead of baking the distance into the
  // range, so re-measuring after a resize or a reflow just works.
  const x = useTransform(scrollYProgress, (p) =>
    scrubbing ? -p * shiftRef.current : 0
  );
  const fillWidth = useTransform(scrollYProgress, (p) => `${p * 100}%`);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (!scrubbing) return;
    const next = Math.round(p * LAST);
    setActive((current) => (current === next ? current : next));
  });

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const inner = innerRef.current;
    const rail = railRef.current;
    if (!wrapper || !inner || !rail) return;

    const wide = window.matchMedia("(min-width: 1024px)");
    const motionOk = window.matchMedia(
      "(prefers-reduced-motion: no-preference)"
    );

    const measure = () => {
      // Subtract the live transform so this reads the rail's resting geometry.
      const rect = rail.getBoundingClientRect();
      const applied = readTranslateX(rail);
      const restingLeft = rect.left - applied;
      const viewport = document.documentElement.clientWidth;

      // Travel until the last panel's text ends one gutter in from the right
      // edge, mirroring the space the first panel gets on the left. Stopping at
      // the rail's own edge would leave the text only as far in as its own
      // padding, which reads as cramped.
      const last = rail.lastElementChild as HTMLElement | null;
      let restingContentRight = restingLeft + rect.width;
      if (last) {
        const ownGap = parseFloat(getComputedStyle(last).paddingRight) || 0;
        restingContentRight =
          last.getBoundingClientRect().right - applied - ownGap;
      }

      shiftRef.current = Math.max(
        restingContentRight - viewport + restingLeft,
        0
      );
    };

    const sync = () => {
      const scrub = wide.matches && motionOk.matches;
      setScrubbing(scrub);

      if (scrub) {
        wrapper.style.height = "";
        inner.style.position = "";
        inner.style.height = "";
        inner.style.overflow = "";
        rail.style.overflowX = "";
        rail.style.scrollSnapType = "";
        measure();
        return;
      }

      // Wide screen but motion is unwelcome: drop the tall scroll track and
      // expose the rail as a plain horizontal scroll-snap strip instead.
      if (wide.matches) {
        wrapper.style.height = "auto";
        inner.style.position = "static";
        inner.style.height = "auto";
        inner.style.overflow = "visible";
        rail.style.overflowX = "auto";
        rail.style.scrollSnapType = "x mandatory";
      }
    };

    sync();
    window.addEventListener("resize", sync);
    wide.addEventListener("change", sync);
    motionOk.addEventListener("change", sync);
    // Measure only, so style writes in sync() cannot feed back into a loop.
    const observer = new ResizeObserver(measure);
    observer.observe(rail);

    return () => {
      window.removeEventListener("resize", sync);
      wide.removeEventListener("change", sync);
      motionOk.removeEventListener("change", sync);
      observer.disconnect();
    };
  }, []);

  return (
    <section id="experience" className="scroll-mt-24 bg-black">
      {items.length === 0 ? null : (
        <div ref={wrapperRef} className="py-20 lg:h-[280vh] lg:py-0">
          <div
            ref={innerRef}
            className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-between lg:overflow-hidden lg:py-16"
          >
            <Container>
              <SectionHeader
                title="Where the work happened"
                description="Companies behind the journey."
                tone="dark"
              />
            </Container>

            <Container className="mt-12 lg:mt-0 lg:flex lg:flex-1 lg:items-center">
              <motion.div
                ref={railRef}
                style={{ x }}
                className="flex flex-col gap-2 lg:w-max lg:flex-row lg:gap-0"
              >
                {items.map((item, index) => (
                  <Panel
                    key={item.company}
                    item={item}
                    index={index}
                    scrubbing={scrubbing}
                    active={active}
                  />
                ))}
              </motion.div>
            </Container>

            <Container className="hidden lg:block">
              <div className="flex items-center gap-6">
                <div className="relative h-px flex-1 bg-white/15">
                  <motion.div
                    style={{ width: fillWidth }}
                    className="absolute inset-y-0 left-0 bg-orange"
                  />
                  {items.map((item, index) => {
                    const at = items.length > 1 ? index / LAST : 0;
                    return (
                      <span
                        key={item.company}
                        className={`absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 ${index === active ? "scale-150 bg-orange" : "bg-white/25"
                          }`}
                        style={{ left: `calc(${at * 100}% + ${8 - at * 16}px)` }}
                      />
                    );
                  })}
                </div>
              </div>
            </Container>
          </div>
        </div>
      )}
    </section>
  );
}
