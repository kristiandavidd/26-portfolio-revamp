"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  GraduationCap,
  Hammer,
  PenLine,
  PenTool,
  ShoppingBag,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { activities, type ActivityIcon } from "@/data/profile";
import { useDepthY } from "@/components/ui/depth";

const ICONS: Record<ActivityIcon, LucideIcon> = {
  design: PenTool,
  writing: PenLine,
  selling: ShoppingBag,
  building: Hammer,
  teaching: GraduationCap,
  community: Users,
};

type Activity = (typeof activities)[number];

const WORD =
  "font-display text-[13vw] leading-[0.92] uppercase sm:text-[7.5vw] lg:text-[6rem]";

function Line({ item }: { item: Activity }) {
  const ref = useRef<HTMLDivElement>(null);
  const still = useReducedMotion();
  const Icon = ICONS[item.icon] ?? PenTool;

  // Two timelines per line. `drift` spans the whole transit and carries the
  // parallax; `lit` is deliberately short and entry-only, so a word switches on
  // as it crosses the reading line and stays on rather than pulsing.
  const { scrollYProgress: drift } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const { scrollYProgress: lit } = useScroll({
    target: ref,
    offset: ["start 0.92", "start 0.42"],
  });

  // Three stops instead of two, so the word comes up like a lamp warming rather
  // than snapping from grey to black.
  const litOpacity = useTransform(lit, [0, 0.5, 1], [0, 0.3, 1]);
  const iconOpacity = useTransform(lit, [0, 0.45, 1], [0, 0.45, 1]);
  const iconScale = useTransform(lit, [0, 1], [0.72, 1]);
  const rule = useTransform(lit, [0, 1], [0, 1]);

  const iconY = useDepthY(drift, "foreground", 110);
  const ghostY = useDepthY(drift, "atmosphere", 110);

  return (
    <div
      ref={ref}
      className="group relative border-t border-black/10 py-8 sm:py-12"
    >
      {/* The same mark twice, at two depths: a large faint one on the slow plane
          behind, a small solid one on the fast plane in front. */}
      <motion.span
        aria-hidden
        style={still ? undefined : { y: ghostY }}
        className="pointer-events-none absolute -top-6 right-0 text-black/[0.07] select-none"
      >
        <Icon size={120} strokeWidth={1.1} />
      </motion.span>

      <div className="relative flex items-center gap-4 sm:gap-9">
        {/* Runs ahead of the page, so it crosses the word as the line passes. */}
        <motion.span
          style={
            still ? undefined : { y: iconY, opacity: iconOpacity, scale: iconScale }
          }
          className="flex h-12 w-12 shrink-0 items-center justify-center bg-orange text-black sm:h-16 sm:w-16"
        >
          <Icon size={22} strokeWidth={2} aria-hidden />
        </motion.span>

        {item.url ? (
          <a href={item.url} target="_blank" rel="noreferrer noopener" className="relative min-w-0">
            <Word item={item} litOpacity={litOpacity} still={!!still} />
          </a>
        ) : (
          <div className="relative min-w-0">
            <Word item={item} litOpacity={litOpacity} still={!!still} />
          </div>
        )}
      </div>

      <motion.div
        aria-hidden
        style={still ? undefined : { scaleX: rule }}
        className="mt-7 h-px origin-left bg-black/15"
      />

      <motion.p
        style={still ? undefined : { opacity: litOpacity }}
        className="relative mt-5 max-w-xl text-sm leading-relaxed text-black/60"
      >
        {item.description ? (
          item.description
        ) : (
          <span className="font-mono text-[11px] tracking-[0.15em] text-black/30 uppercase">
            [ description pending ]
          </span>
        )}
      </motion.p>
    </div>
  );
}

// The word is drawn twice: a grey base, and a black copy on top whose opacity is
// scrubbed. Only opacity animates, so the switch costs nothing to render and the
// text underneath stays a single readable node.
function Word({
  item,
  litOpacity,
  still,
}: {
  item: Activity;
  litOpacity: MotionValue<number>;
  still: boolean;
}) {
  return (
    <>
      <h3 className={`${WORD} text-black/12 transition-colors group-hover:text-black/20`}>
        {item.title}
      </h3>
      <motion.span
        aria-hidden
        style={still ? undefined : { opacity: litOpacity }}
        className={`${WORD} pointer-events-none absolute inset-0 text-black`}
      >
        {item.title}
      </motion.span>
    </>
  );
}

export function Activities() {
  if (activities.length === 0) return null;

  return (
    <section id="activities" className="relative scroll-mt-24 bg-white">
      <Container className="pb-20 sm:pb-28">
        <SectionHeader
          title="Off the clock"
          description="Design, writing, selling. What runs alongside the engineering."
        />

        <div className="mt-14 border-b border-black/10 sm:mt-20">
          {activities.map((item) => (
            <Line key={item.title} item={item} />
          ))}
        </div>
      </Container>
    </section>
  );
}
