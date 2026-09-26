"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { community } from "@/data/profile";
import { useDepthY } from "@/components/ui/depth";

// The source notes list three of these as the same programme in three
// consecutive years, so the years are grouped instead of being given a row each.
// The streak is the story, and one row per year would hide it behind repetition.
const PROGRAMMES = community.reduce<{ programme: string; years: string[] }[]>(
  (acc, entry) => {
    const found = acc.find((item) => item.programme === entry.programme);
    if (found) found.years.push(entry.period);
    else acc.push({ programme: entry.programme, years: [entry.period] });
    return acc;
  },
  []
);

const ROLE = community[0]?.role ?? "Facilitator";
const YEARS = [...new Set(community.map((entry) => entry.period))].sort();

export function Community() {
  const ref = useRef<HTMLElement>(null);
  const still = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Three planes, same ladder as every other section: the backdrop word barely
  // moves, the role sits on the subject plane, the list runs ahead of it.
  const backdropY = useDepthY(scrollYProgress, "atmosphere", 260);
  const roleY = useDepthY(scrollYProgress, "subject", 170);
  const listY = useDepthY(scrollYProgress, "foreground", 170);

  if (community.length === 0) return null;

  return (
    <section
      ref={ref}
      id="community"
      className="relative scroll-mt-24 overflow-x-clip bg-white"
    >
      <motion.span
        aria-hidden
        style={still ? undefined : { y: backdropY }}
        className="font-display pointer-events-none absolute inset-x-0 top-[34%] text-center text-[17vw] leading-none whitespace-nowrap text-black/[0.035] uppercase select-none"
      >
        Community
      </motion.span>

      <Container className="relative pb-20 sm:pb-28">
        <SectionHeader
          title="Passing it on"
          description="Programmes I've helped run, and the years I kept coming back to them."
        />

        <div className="mt-16 grid gap-12 sm:mt-24 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:items-start sm:gap-20">
          {/* The role leads rather than the programme names. All four entries
              carry the same one, so it is the thing here actually worth setting
              in display type. */}
          <motion.div style={still ? undefined : { y: roleY }}>
            <h3 className="font-display text-[clamp(2.75rem,9vw,5.5rem)] leading-[0.9] text-black uppercase">
              {ROLE}
            </h3>
            <p className="mt-5 font-mono text-[11px] tracking-[0.22em] text-black/45 uppercase">
              {community.length} engagements · {YEARS.join(" · ")}
            </p>
          </motion.div>

          <motion.ul
            style={still ? undefined : { y: listY }}
            className="flex flex-col gap-10"
          >
            {PROGRAMMES.map((item) => (
              <li key={item.programme}>
                <p className="font-display text-[1.5rem] leading-[1.05] text-black uppercase sm:text-[2rem]">
                  {item.programme}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                  {/* One mark per year. Three in a row is the point: this is a
                      role taken up again, not a one-off engagement. */}
                  <span aria-hidden className="flex gap-1.5">
                    {item.years.map((year) => (
                      <span key={year} className="h-2.5 w-7 bg-orange" />
                    ))}
                  </span>
                  <span className="font-mono text-[11px] tracking-[0.18em] text-black/45 uppercase">
                    {item.years.join(" · ")}
                  </span>
                </div>
              </li>
            ))}
          </motion.ul>
        </div>
      </Container>
    </section>
  );
}
