import { HeroVisual } from "./HeroVisual";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative isolate flex scroll-mt-24 flex-col items-center overflow-hidden pt-16 lg:min-h-[max(100vh,40rem)] lg:pt-20"
    >
      {/* Backlight: an orange glow sitting behind the portrait. It sits behind
          the artwork, so the portrait itself stays untouched. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 55% 78% at 50% 90%, color-mix(in srgb, var(--color-orange) 72%, transparent), transparent 72%)",
        }}
      />

      {/* Sits on top of the artwork. The pattern's top rows are nearly empty,
          so the headline can overlap them without hurting legibility. */}
      <h1 className="font-display relative z-20 shrink-0 px-4 text-center text-[clamp(1.5rem,9vw,5.25rem)] leading-[0.95] whitespace-nowrap sm:px-6">
        <span className="block">Complex products,</span>
        <span className="block text-orange">made simple.</span>
      </h1>

      {/* On small screens the artwork simply follows the headline, so the hero
          only takes the height it needs instead of leaving a gap. From lg it
          leaves the flow and pins to the bottom, so it may be taller than the
          space left under the headline and still sit flush with the bottom of
          the first screen. Width tracks the viewport (docking devtools cannot
          shrink it), capped by the viewport height, with a floor so it can never
          collapse. */}
      <div className="z-0 mt-10 w-full lg:absolute lg:inset-x-0 lg:bottom-0 lg:mx-auto lg:mt-0 lg:w-[min(100%,clamp(36rem,calc((100vh_-_9rem)*1.326),64rem))]">
        <HeroVisual />
      </div>

      {/* Fades the bottom of the hero into black so it hands over to the dark
          About section without a hard seam. Sits above the artwork on purpose. */}
      <div
        aria-hidden
        className="
          absolute inset-x-0 bottom-0 z-10 h-[36%]
          bg-[linear-gradient(to_top,var(--color-black)_0%,rgba(0,0,0,0.9)_20%,rgba(0,0,0,0.55)_45%,rgba(0,0,0,0.2)_70%,transparent_100%)]
        "
      />
    </section>
  );
}
