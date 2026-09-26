"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  type MotionProps,
  type Variants,
} from "framer-motion";
import { Brain, Cloud, Flame, Layers, type LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { community, type CommunityIcon } from "@/data/profile";
import { useDepthY } from "@/components/ui/depth";

const ICONS: Record<CommunityIcon, LucideIcon> = {
  cloud: Cloud,
  brain: Brain,
  layers: Layers,
  flame: Flame,
};

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

// A row assembles rather than fades in: the rule above it draws across, the mark
// lands with a touch of spring, the programme lifts out of its own box, and the
// result slides in from the right. Every piece is a transform or an opacity, so
// nothing here forces the browser to repaint a row while the page is moving.
const row: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

const rule: Variants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.7, ease: EASE } },
};

const mark: Variants = {
  hidden: { scale: 0.5, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 320, damping: 24 },
  },
};

const programme: Variants = {
  hidden: { y: "115%" },
  show: { y: "0%", transition: { duration: 0.65, ease: EASE } },
};

const meta: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

const result: Variants = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
};

export function Community() {
  const ref = useRef<HTMLElement>(null);
  const still = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const runY = useDepthY(scrollYProgress, "subject", 55);

  // Reduced motion is handed the finished state outright — no motion props, so
  // every row simply renders where it belongs.
  const reveal: MotionProps = still
    ? {}
    : {
        initial: "hidden",
        whileInView: "show",
        viewport: { once: true, margin: "-12% 0px -12% 0px" },
      };

  if (community.length === 0) return null;

  return (
    <section
      ref={ref}
      id="community"
      className="relative scroll-mt-24 overflow-x-clip bg-white"
    >
      <Container className="relative pt-20 pb-20 sm:pt-28 sm:pb-28">
        <SectionHeader
          title="Passing it on"
          description="The work doesn't stop at the screen. Teaching, running sessions, and helping people get to grips with the tools I use every day."
        />

        {/* Four engagements, each told on its own terms. Deliberately not grouped
            by programme or laid out on a timeline: the three Arcade years are one
            repeated programme, and folding them together made the section read
            as a table about dates instead of four separate results.

            The programme carries the weight and the role takes the accent; the
            result sits off to the side as a tag. Setting the figures in display
            type made them out-shout the programme they belong to, and it left no
            room for the line explaining what each figure is measured against. */}
        <motion.ul
          style={still ? undefined : { y: runY }}
          className="mt-16 flex flex-col sm:mt-20"
        >
          {community.map((entry) => {
            const Icon = ICONS[entry.icon];

            return (
              <motion.li
                key={`${entry.programme}-${entry.period}`}
                variants={row}
                {...reveal}
                className="relative border-t border-black/10 last:border-b"
              >
                {/* Drawn over the row's own hairline, so the rule reads as
                    travelling across rather than arriving all at once. */}
                <motion.span
                  aria-hidden
                  variants={rule}
                  className="absolute inset-x-0 top-0 h-px origin-left bg-black/25"
                />

                <div className="flex gap-4 py-10 sm:gap-6 sm:py-12">
                  {/* The mark is its own column so everything to its right —
                      programme, role, result — starts on one line down the whole
                      list. Stacking it above the text instead left the role line
                      hanging out to the left of the name on a phone. */}
                  <motion.span
                    variants={mark}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange/10 text-orange"
                  >
                    <Icon size={18} strokeWidth={1.75} />
                  </motion.span>

                  <div className="grid min-w-0 flex-1 gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-10">
                    <div className="min-w-0">
                      {/* Masked, so the programme rises into place instead of
                          being there. The padding keeps descenders off the clip
                          edge; the negative margin takes the space back. */}
                      <div className="-mb-1 overflow-hidden pb-1">
                        <motion.h3
                          variants={programme}
                          className="font-display text-[1.5rem] leading-[1.05] text-balance text-black uppercase sm:text-[1.9rem]"
                        >
                          {entry.programme}
                        </motion.h3>
                      </div>

                      <motion.p
                        variants={meta}
                        className="mt-3 font-mono text-[13px] tracking-[0.16em] uppercase"
                      >
                        <span className="text-orange">{entry.role}</span>
                        <span aria-hidden className="text-black/30">
                          {" · "}
                        </span>
                        <span className="text-black/55">{entry.period}</span>
                      </motion.p>
                    </div>

                    {/* One fixed width and one fixed minimum height, so the four
                        badges are the same block regardless of how long the note
                        runs — ragged tags down the column were the inconsistency.
                        On a phone it goes full width instead of hugging its text,
                        which stops four different widths stacking up. */}
                    <motion.div
                      variants={result}
                      className="flex w-full flex-wrap items-baseline gap-x-3 gap-y-1 rounded-2xl border border-black/12 px-5 py-3.5 sm:min-h-[4.75rem] sm:w-72 sm:flex-col sm:items-start sm:justify-center sm:gap-y-2"
                    >
                      <span className="font-mono text-[14px] leading-none font-semibold tracking-[0.08em] text-black uppercase">
                        {entry.metric}
                      </span>

                      <span className="font-mono text-[11px] tracking-[0.04em] text-black/55 uppercase">
                        {entry.metricNote}
                      </span>
                    </motion.div>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </motion.ul>
      </Container>
    </section>
  );
}
