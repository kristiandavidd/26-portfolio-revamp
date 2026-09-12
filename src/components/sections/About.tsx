import Image from "next/image";
import aboutBg from "../../../public/images/about-bg.png";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { profile } from "@/data/profile";

export function About() {
  return (
    <section id="about" className="scroll-mt-24 bg-black">
      {/* The copy rides on the photo's own night sky, so it costs no extra
          height. The height is a fraction of the width rather than a fixed px:
          the photo is scaled by width, so a fixed height would crop deeper and
          deeper as the screen widens, until only the sky was left and the
          flowers fell out of frame. 40vw holds the visible slice at ~71% of the
          photo at every width, which keeps both the sky and the flowers in
          shot. The floors cover narrow screens, where the copy needs more room
          and the sm breakpoint makes it larger still. Cropping is anchored to
          the top. */}
      <div className="relative h-[max(30rem,40vw)] w-full sm:h-[max(34rem,40vw)]">
        <Image
          src={aboutBg}
          alt=""
          fill
          sizes="(min-width: 1024px) 100vw, (min-width: 640px) 970px, 280vw"
          className="object-cover object-top"
        />

        {/* Solid black across the top 30% of the photo, then a fade to nothing
            by 50%. Because the overlay spans half the band, its own 60% stop is
            the photo's 30%. */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[50%] bg-[linear-gradient(to_bottom,var(--color-black)_0%,var(--color-black)_60%,transparent_100%)]"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[20%] bg-[linear-gradient(to_top,var(--color-black),transparent)]"
        />

        <Container className="relative pt-6 sm:pt-12">
          <Reveal className="text-center">
            <p className="font-display text-sm tracking-[0.25em] text-orange uppercase">
              {profile.name}
            </p>
            <h2 className="font-display mt-3 text-2xl leading-[1.1] text-balance text-white sm:mt-4 sm:text-4xl lg:text-5xl">
              the person behind the work
            </h2>
            <p className="mx-auto mt-4 max-w-4xl text-xs font-light leading-snug text-white/75 sm:mt-6 sm:text-base sm:leading-relaxed">
              {profile.bio}
            </p>
          </Reveal>
        </Container>
      </div>

      {/* Black space that runs straight into the black Experience section. */}
      <div className="h-8 sm:h-10" />
    </section>
  );
}
