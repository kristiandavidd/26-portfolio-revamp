import Image from "next/image";
import type { ProfileView } from "@repo/db";
import { Container, Reveal } from "@repo/ui";

export function About({ profile }: { profile: ProfileView }) {
  return (
    <section id="about" className="scroll-mt-24 bg-black">
      <div className="relative h-[max(30rem,40vw)] w-full sm:h-[max(34rem,40vw)]">
        {profile.aboutBackgroundUrl ? (
          <Image
            src={profile.aboutBackgroundUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 100vw, (min-width: 640px) 970px, 280vw"
            className="object-cover object-top"
          />
        ) : null}

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
            {profile.aboutHeading ? (
              <h2 className="font-display mt-3 text-2xl leading-[1.1] text-balance text-white sm:mt-4 sm:text-4xl lg:text-5xl">
                {profile.aboutHeading}
              </h2>
            ) : null}
            <p className="mx-auto mt-4 max-w-4xl text-xs font-light leading-snug text-white/75 sm:mt-6 sm:text-base sm:leading-relaxed">
              {profile.bio}
            </p>
          </Reveal>
        </Container>
      </div>

      <div className="h-8 sm:h-10" />
    </section>
  );
}
