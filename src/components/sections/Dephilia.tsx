"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useInView,
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
import { useDepthY, type Depth } from "@/components/ui/depth";

// A halftone screen, built the way a press builds one: a single dot grid, with
// three dot sizes stacked on the same grid and faded out at different rates. The
// grid never changes, so it reads as one screen whose dots shrink — which is
// what a printed gradient actually is. Three different grid sizes would read as
// three patterns instead.
const GRID = "12px 12px";
const HALFTONE_DOTS = [
  { stops: "3.4px, transparent 3.8px", fade: 46 },
  { stops: "2.2px, transparent 2.6px", fade: 72 },
  { stops: "1.1px, transparent 1.4px", fade: 94 },
];

/**
 * The same screen in any ink, so the hand-off band and the CTA panel are
 * literally the same plate printed twice rather than two lookalike patterns.
 */
function halftone(ink: string) {
  return HALFTONE_DOTS.map((dot) => ({
    fade: dot.fade,
    image: `radial-gradient(circle, ${ink} ${dot.stops})`,
  }));
}

const HALFTONE_ON_WHITE = halftone("var(--color-black)");
// Dim white: the same dots that read as a press change on a white band would
// shout at full strength on a black panel.
const HALFTONE_ON_BLACK = halftone(
  "color-mix(in srgb, var(--color-white) 22%, transparent)"
);

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
  const ref = useRef<HTMLElement>(null);
  const still = useReducedMotion();
  const [iconFailed, setIconFailed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const accent = product.accent ?? "#ff5c1a";

  // Colour is a property of being looked at, and scrolling to a card is looking
  // at it just as much as pointing at it is. The band is the middle tenth of the
  // screen, so exactly one card is lit at a time while scrolling and the
  // highlight travels down the column with you.
  const onScreen = useInView(ref, { margin: "-45% 0px -45% 0px" });
  const lit = hovered || onScreen;

  // The cards now run down a single centre column, so there is no left/right
  // crossing to carry the depth any more. Each card rides one plane instead,
  // alternating between the two middle rungs — same rhythm, without needing two
  // columns to read it. The card moves as one piece so the artwork and the
  // white fade stay registered with the copy sitting on them.
  //
  // Travel is kept small on purpose. The drift stacks on top of the gap between
  // cards — two neighbours on opposite rungs separate by both amplitudes at
  // once — so this is the real spacing knob, and the CSS gap only sets the
  // floor. At the old amplitude it added most of a card of empty air between
  // one product and the next, which is exactly what made the column read as
  // loosely spaced however small the gap got.
  const depth: Depth = index % 2 === 1 ? "foreground" : "subject";

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const drift = useDepthY(scrollYProgress, depth, 25);

  // The copy is the layer that carries this section's parallax, and it is the
  // only one that can. The backdrop has to keep its top edge pinned to the top
  // of the card, so any shift either opens a gap above the artwork or eats into
  // it. The copy, by contrast, has clear air above and below it, so it can ride
  // a different plane from the card it sits in. That difference in rate, read
  // against the artwork behind it, is where the depth comes from.
  //
  // One way, and packed into the window where the card is on screen. Spread
  // across the whole transit the copy moved roughly five pixels per hundred of
  // scroll, which is why the parallax never registered as movement at all: the
  // tracked range is the card plus the viewport, so most of it happens while
  // the card is still off screen. These stops spend the travel where it can be
  // seen and ease out at the end so it settles rather than stopping dead.
  const contentDrift = useTransform(scrollYProgress, [0.28, 0.72], [0, -70]);

  return (
    <motion.article
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={still ? undefined : { y: drift }}
      className="relative mx-auto flex w-full max-w-5xl flex-col items-center justify-center overflow-hidden rounded-none px-6 py-14 text-center min-h-[34rem] sm:aspect-[3/2] sm:min-h-0 sm:rounded-[2rem] sm:px-12 sm:py-16"
    >
      {product.background ? (
        <>
          {/* Held desaturated until the card is looked at, so the column reads
              as one quiet surface and only the product being looked at carries
              colour. Kept well under full strength: at full opacity the artwork
              fights the orange accents rather than sitting behind them. The blur
              is only a softening pass, not a smear. The fade is what keeps the
              copy legible.

              The card is 3:2, so a 1:1 backdrop scaled to the card's width is
              taller than the card and its foot is simply cut off. That is the
              point, not a side effect: the copy sits at the bottom of the card
              and the white fade already covers that band, so the part being
              lost is the part nothing was reading. The card shows roughly two
              thirds of the artwork and lets the rest fall past the bottom,
              instead of being stretched until all of it fits — which is what
              had made the column so airy.

              `top` because the weight of a mark sits at its top; a centred crop
              would take a bite out of both ends.

              The min height below `sm` is what sizes the artwork on a phone. A
              cover crop scales to whichever axis binds, so a taller card scales
              the artwork up until it fills that height — and being square, it
              then runs wider than the card and spills off the sides. Vertical
              is the axis that must never be cut on a narrow card, so the height
              is handed to the artwork and the overflow is sent sideways.

              Deliberately not scaled past the card. Oversizing it to buy the
              drift some room also crops the two edges that have to stay whole:
              the sides on a wide card, the top and bottom on a narrow one. One
              cover crop on one axis is the most this can take.

              The desaturation is on a long, delayed curve. It is a mood change
              rather than a hover flick, so it wants to arrive a beat after the
              card does and take its time getting there. */}
          <Image
            src={product.background}
            alt=""
            fill
            sizes="(min-width: 1024px) 1024px, 100vw"
            className={`object-cover object-top opacity-40 blur-[2px] transition-[filter] duration-[1600ms] delay-200 ease-out ${
              lit ? "grayscale-0" : "grayscale"
            }`}
          />
          <span
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to top, var(--color-white) 0%, color-mix(in srgb, var(--color-white) 86%, transparent) 38%, transparent 78%)",
            }}
          />
        </>
      ) : null}

      {/* Layer: the copy, riding a slower plane than the card so it separates
          from the artwork behind it as the column moves. */}
      <motion.div
        style={still ? undefined : { y: contentDrift }}
        className="relative flex flex-col items-center"
      >
        <div className="relative">
          {product.icon && !iconFailed ? (
            <span className="relative block h-28 w-28 sm:h-32 sm:w-32">
              <Image
                src={product.icon}
                alt=""
                fill
                sizes="128px"
                onError={() => setIconFailed(true)}
                className="object-contain"
              />
            </span>
          ) : (
            /* Products whose artwork has not landed yet still get a mark, so the
               column keeps its rhythm instead of opening a hole. An icon that
               404s falls back here rather than leaving an empty box. */
            <span
              className="flex h-28 w-28 items-center justify-center rounded-[1.75rem] shadow-[0_18px_40px_-24px_rgba(10,10,10,0.5)] sm:h-32 sm:w-32"
              style={{ backgroundColor: accent }}
            >
              <span className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {monogram(product.name)}
              </span>
            </span>
          )}
        </div>

        <h3 className="font-display relative mt-8 text-[2.25rem] leading-[0.95] text-balance text-black uppercase sm:text-[3rem]">
          {product.name}
        </h3>
        <p className="relative mt-4 font-mono text-[10px] tracking-[0.2em] text-black/40 uppercase">
          {product.category}
        </p>
        <p className="relative mt-6 max-w-md text-sm leading-relaxed text-black/60 sm:text-base">
          {product.description}
        </p>
      </motion.div>
    </motion.article>
  );
}

export function Dephilia() {
  if (dephiliaProducts.length === 0) return null;

  return (
    <section
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
        {HALFTONE_ON_WHITE.map((layer) => (
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

      <Container className="relative pt-[42vh]">
        <div className="flex flex-col items-center">
          <SectionHeader
            align="center"
            width="wide"
            title="Built at Dephilia"
            description={`${dephilia.description} Five products have come out of it — three pieces of shared infrastructure the client work runs on, and two marketplaces.`}
          >
            {/* The seat I sit in belongs to the studio rather than to any one
                product, so it reads directly under the name. The legal entity
                is the footnote at the end of the block. */}
            <span className="mt-6 inline-block rounded-full bg-orange px-4 py-1.5 font-mono text-[10px] tracking-[0.2em] text-white uppercase">
              {dephilia.role}
            </span>
          </SectionHeader>

          <p className="mt-8 font-mono text-[11px] tracking-[0.2em] text-black uppercase">
            {dephilia.legalName}
          </p>
        </div>
      </Container>

      {/* Deliberately outside the container: on a phone the cards run edge to
          edge, so each backdrop gets the full screen width rather than what is
          left after the section gutters. The cards centre themselves at their
          own max width on wider screens, so nothing else changes. */}
      <div className="relative mt-16 flex flex-col gap-2 sm:mt-20 sm:gap-4">
        {dephiliaProducts.map((product, index) => (
          <Product key={product.name} product={product} index={index} />
        ))}
      </div>

      <Container className="relative pb-20 sm:pb-28">
        {/* The panel is the link rather than a button sitting in one, so the
            whole block is the target and only the domain has to look pressable.
            The tagline gets to be the headline here instead of sitting in the
            header, where it was doing the same job twice. */}
        <a
          href={dephilia.url}
          target="_blank"
          rel="noreferrer noopener"
          className="group relative mx-auto mt-14 flex w-full max-w-5xl flex-col items-center gap-6 overflow-hidden rounded-[16px] bg-black px-8 py-12 text-center sm:mt-16 sm:px-14 sm:py-16"
        >
          {/* The same screen that carries the hand-off band, printed in a dim
              white instead of black and climbing from the foot of the panel.
              Reusing the plate rather than drawing a second one keeps the
              section printed throughout, and the dim ink keeps it as texture
              rather than a second thing to read. */}
          <span aria-hidden className="pointer-events-none absolute inset-0">
            {HALFTONE_ON_BLACK.map((layer) => (
              <span
                key={layer.fade}
                className="absolute inset-0"
                style={{
                  backgroundImage: layer.image,
                  backgroundSize: GRID,
                  maskImage: `linear-gradient(to top, #000 0%, #000 ${layer.fade * 0.3}%, transparent ${layer.fade}%)`,
                  WebkitMaskImage: `linear-gradient(to top, #000 0%, #000 ${layer.fade * 0.3}%, transparent ${layer.fade}%)`,
                }}
              />
            ))}
          </span>

          <span className="relative font-mono text-[10px] tracking-[0.25em] text-white/40 uppercase">
            The studio behind the work
          </span>

          <span className="font-display relative text-[1.75rem] leading-[0.95] text-balance text-white uppercase sm:text-[2.75rem]">
            {dephilia.tagline}
          </span>

          {/* A real button rather than an underlined line of text: on a black
              panel the affordance has to be carried by the fill, and the same
              orange as every other action on the site does that without having
              to be explained. */}
          <span className="relative mt-2 inline-flex items-center gap-3 bg-orange px-6 py-3 font-mono text-[11px] tracking-[0.15em] text-white group-hover:text-orange uppercase transition-colors group-hover:bg-white">
            {dephilia.url.replace(/^https?:\/\//, "")}
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-1.5"
            >
              &rarr;
            </span>
          </span>
        </a>
      </Container>
    </section>
  );
}
