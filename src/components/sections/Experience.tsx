"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { experience } from "@/data/profile";

function monogram(company: string) {
  return company
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

const LAST = experience.length - 1;

// offsetLeft and scrollWidth round to whole pixels, which leaves the rail a
// fraction short and clips the last panel. Reading the live transform back out
// lets us use the fractional rect instead.
function readTranslateX(element: HTMLElement) {
  const transform = getComputedStyle(element).transform;
  if (!transform || transform === "none") return 0;
  return new DOMMatrixReadOnly(transform).m41;
}

export function Experience() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const shiftRef = useRef(0);
  const [scrubbing, setScrubbing] = useState(false);
  const [active, setActive] = useState(0);

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
      {/* The tall track is what turns vertical scrolling into horizontal travel.
          Without it there is nothing for the sticky viewport to scrub against. */}
      <div ref={wrapperRef} className="py-20 lg:h-[280vh] lg:py-0">
        <div
          ref={innerRef}
          className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-between lg:overflow-hidden lg:py-16"
        >
          <Container>
            <SectionHeader title="Where the work happened" tone="dark" />
          </Container>

          <Container className="mt-12 lg:mt-0 lg:flex lg:flex-1 lg:items-center">
            <motion.div
              ref={railRef}
              style={{ x }}
              className="flex flex-col gap-12 lg:w-max lg:flex-row lg:gap-0"
            >
              {experience.map((item) => (
                <article
                  key={item.company}
                  className="relative lg:w-[52vw] lg:shrink-0 lg:snap-start lg:border-l lg:border-white/10 lg:px-10 lg:first:border-l-0 lg:first:pl-0 "
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -top-6 right-0 font-display text-[6rem] leading-none font-semibold text-white/[0.05] select-none lg:-top-16 lg:text-[11rem]"
                  >
                    {monogram(item.company)}
                  </span>

                  <div className="relative flex items-start gap-4 sm:gap-6">
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-white/5 sm:h-20 sm:w-20">
                      {item.logo ? (
                        <Image
                          src={item.logo}
                          alt={`${item.company} logo`}
                          fill
                          sizes="80px"
                          className="object-contain p-2 sm:p-3.5"
                        />
                      ) : (
                        <span className="text-lg font-semibold tracking-wide text-white/80 sm:text-2xl">
                          {monogram(item.company)}
                        </span>
                      )}
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
                      <p className="mt-2 text-base text-orange sm:text-lg">
                        {item.role}
                      </p>
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
                {experience.map((item, index) => {
                  const at = index / LAST;
                  return (
                    <span
                      key={item.company}
                      className={`absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 ${
                        index === active ? "scale-150 bg-orange" : "bg-white/25"
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
    </section>
  );
}
