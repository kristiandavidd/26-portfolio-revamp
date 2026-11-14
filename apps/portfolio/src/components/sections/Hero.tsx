import type { ProfileView } from "@repo/db";
import { HeroVisual } from "./HeroVisual";

export function Hero({ profile }: { profile: ProfileView }) {
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

      <h1 className="font-display relative z-20 w-full shrink-0 px-4 text-center text-[clamp(1.25rem,6vw,4.75rem)] leading-[0.95] text-balance sm:px-6">
        <span className="block">{profile.heroLine1}</span>
        <span className="block text-orange">{profile.heroLine2}</span>
      </h1>

      <div className="z-0 mt-10 w-full lg:absolute lg:inset-x-0 lg:bottom-0 lg:mx-auto lg:mt-0 lg:w-[min(100%,clamp(36rem,calc((100vh_-_9rem)*1.326),64rem))]">
        <HeroVisual
          portraitUrl={profile.heroPortraitUrl}
          portraitWidth={profile.heroPortraitWidth}
          portraitHeight={profile.heroPortraitHeight}
          patterns={profile.heroPatterns}
        />
      </div>

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
