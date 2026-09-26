"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  dephilia,
  dephiliaProducts,
  type DephiliaProduct,
} from "@/data/profile";
import {
  EASE_STOPS,
  easedRange,
  useDepthY,
  type Depth,
} from "@/components/ui/depth";

// A halftone screen, built the way a press builds one: a single dot grid, with
// three dot sizes stacked on the same grid and faded out at different rates. The
// grid never changes, so it reads as one screen whose dots shrink — which is
// what a printed gradient actually is. Three different grid sizes would read as
// three patterns instead.
const GRID = "12px 12px";
const HALFTONE = [
  {
    image:
      "radial-gradient(circle, var(--color-black) 3.4px, transparent 3.8px)",
    fade: 46,
  },
  {
    image:
      "radial-gradient(circle, var(--color-black) 2.2px, transparent 2.6px)",
    fade: 72,
  },
  {
    image:
      "radial-gradient(circle, var(--color-black) 1.1px, transparent 1.4px)",
    fade: 94,
  },
];

function monogram(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

function Product({
  product,
  index,
}: {
  product: DephiliaProduct;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const still = useReducedMotion();
  const accent = product.accent ?? "#ff5c1a";

  // Alternating planes. The even product sits on the subject plane and creeps
  // towards the glass as it passes; the odd one starts in front and settles
  // back. Because they are on different planes they cross each other on the way
  // through, which is the part the eye actually reads as depth.
  const near = index % 2 === 1;
  const iconDepth: Depth = near ? "foreground" : "subject";
  const textDepth: Depth = near ? "subject" : "backdrop";

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const iconY = useDepthY(scrollYProgress, iconDepth, 150);
  const textY = useDepthY(scrollYProgress, textDepth, 150);
  const iconScale = useTransform(
    scrollYProgress,
    EASE_STOPS,
    easedRange(near ? 1.08 : 0.92, near ? 0.94 : 1.06)
  );

  return (
    <div
      ref={ref}
      className={`flex flex-col gap-8 sm:flex-row sm:items-center sm:gap-16 ${
        near ? "sm:flex-row-reverse" : ""
      }`}
      style={{ "--icon-accent": accent } as React.CSSProperties}
    >
      <motion.div
        style={still ? undefined : { y: iconY, scale: iconScale }}
        className="shrink-0 self-start sm:self-auto"
      >
        {/* These are products rather than case studies, so the tile is not a
            link: there is nothing further to read. The shape is still rounded,
            because it is the one place in this page that has to say "app icon"
            before the label does. */}
        <span
          className="group relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-[1.75rem] border border-black/10 shadow-[0_18px_40px_-24px_rgba(10,10,10,0.5)] transition-transform duration-500 hover:-translate-y-1.5 sm:h-44 sm:w-44"
          style={{ backgroundColor: accent }}
        >
          <span className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {monogram(product.name)}
          </span>
          {/* A gloss edge, so the tile reads as an object rather than a swatch. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[1.75rem] bg-[linear-gradient(150deg,rgba(255,255,255,0.35),transparent_45%)]"
          />
        </span>
      </motion.div>

      <motion.div
        style={still ? undefined : { y: textY }}
        className="relative min-w-0"
      >
        <p className="font-mono text-[10px] tracking-[0.2em] text-black/40 uppercase">
          {product.category}
        </p>
        <h3 className="font-display mt-3 text-[2.25rem] leading-[0.95] text-balance text-black uppercase sm:text-[3rem]">
          {product.name}
        </h3>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-black/60 sm:text-base">
          {product.description}
        </p>
      </motion.div>
    </div>
  );
}

export function Dephilia() {
  const ref = useRef<HTMLElement>(null);
  const still = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const backdropY = useDepthY(scrollYProgress, "atmosphere", 300);

  if (dephiliaProducts.length === 0) return null;

  return (
    <section
      ref={ref}
      id="dephilia"
      className="relative scroll-mt-24 overflow-x-clip bg-white"
    >
      {/* The hand-off from Projects, which now ends right above this section.
          Projects ends on flat black, so this band starts on that exact black
          and breaks it down through a halftone screen rather than cutting or
          simply fading — the section change reads as a press change, which is
          the point. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[36vh]"
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, var(--color-black) 0%, color-mix(in srgb, var(--color-black) 82%, transparent) 22%, color-mix(in srgb, var(--color-black) 40%, transparent) 58%, transparent 100%)",
          }}
        />
        {HALFTONE.map((layer) => (
          <div
            key={layer.fade}
            className="absolute inset-0"
            style={{
              backgroundImage: layer.image,
              backgroundSize: GRID,
              maskImage: `linear-gradient(to bottom, #000 0%, #000 ${layer.fade * 0.35}%, transparent ${layer.fade}%)`,
              WebkitMaskImage: `linear-gradient(to bottom, #000 0%, #000 ${layer.fade * 0.35}%, transparent ${layer.fade}%)`,
            }}
          />
        ))}
      </div>

      <motion.span
        aria-hidden
        style={still ? undefined : { y: backdropY }}
        className="font-display pointer-events-none absolute inset-x-0 top-[30%] text-center text-[19vw] leading-none whitespace-nowrap text-black/[0.04] uppercase select-none"
      >
        Dephilia
      </motion.span>

      <Container className="relative pt-[42vh] pb-20 sm:pb-28">
        <SectionHeader
          title="Built at Dephilia"
          description={`${dephilia.tagline} A studio I founded, and the products the work runs on.`}
        />

        <p className="mt-6 font-mono text-[11px] tracking-[0.2em] text-black/40 uppercase">
          {dephilia.role} · {dephilia.legalName}
        </p>

        <div className="mt-20 flex flex-col gap-24 sm:mt-28 sm:gap-36">
          {dephiliaProducts.map((product, index) => (
            <Product key={product.name} product={product} index={index} />
          ))}
        </div>
      </Container>
    </section>
  );
}
