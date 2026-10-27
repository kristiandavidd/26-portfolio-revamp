"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll } from "framer-motion";
import { useLenis } from "lenis/react";
import { Globe, Mail } from "lucide-react";
import type { ProfileView } from "@repo/db";
import { useDepthY } from "@repo/ui";

/**
 * Lucide carries no brand marks, so the two that matter here are drawn by hand
 * in its idiom — same 24 grid, same stroke, no fills except the dots.
 */
function InstagramMark({ size = 16 }: { size?: number }) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInMark({ size = 16 }: { size?: number }) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="4" />
      <path d="M7.5 10.5V17" />
      <circle cx="7.5" cy="7.25" r="0.75" fill="currentColor" stroke="none" />
      <path d="M11.5 10.5V17m0-3.25a2.5 2.5 0 0 1 5 0V17" />
    </svg>
  );
}

const SOCIAL_ICONS: Record<string, ComponentType<{ size?: number }>> = {
  instagram: InstagramMark,
  linkedin: LinkedInMark,
  website: Globe,
  mail: Mail,
  Instagram: InstagramMark,
  LinkedIn: LinkedInMark,
  Website: Globe,
};

export function Footer({ profile }: { profile: ProfileView }) {
  const ref = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const still = useReducedMotion();
  const lenis = useLenis();
  const [floating, setFloating] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // The backdrop drifts against the card it sits in, so the panel reads as a
  // window onto something rather than a flat sheet.
  const imageDrift = useDepthY(scrollYProgress, "atmosphere", 40);

  // The page signs off full bleed and lifts into a card only once the panel's
  // lower edge has reached the bottom of the window. Measuring that edge
  // directly rather than counting pixels from the document bottom keeps the
  // trigger honest at every width, where the foot inset is different.
  useEffect(() => {
    const measure = () => {
      const card = cardRef.current;
      if (!card) return;
      const gap = window.innerHeight - card.getBoundingClientRect().bottom;
      // Two thresholds: the panel only drops back to full bleed once its lower
      // edge is well clear of the bottom, so the state cannot chatter on the
      // line — and the foot it grows lifts that edge off the line by itself.
      // The trigger carries a few pixels of slack: the end of the scroll is a
      // fractional position, so demanding an exact zero missed it whenever the
      // scroll settled a fraction short.
      setFloating((was) => (was ? gap > -220 : gap > -8));
    };

    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Growing the foot makes the page taller under the reader, which would leave
  // the panel hanging above the end with its reveal below the fold. So for the
  // length of that transition the page is pinned to the bottom instead: the
  // panel lifts into a card and the foot it uncovers is already in view.
  useEffect(() => {
    if (!floating) return;

    const toEnd = () => {
      const end = document.documentElement.scrollHeight;
      if (lenis) {
        // Lenis caches the document height and clamps every target to it, so the
        // aim has to be re-measured first — otherwise the pin is clamped to
        // where the page ended before the foot grew, and nothing moves at all.
        lenis.resize();
        lenis.scrollTo(end, { immediate: true });
      } else {
        window.scrollTo(0, end);
      }
    };

    let frame = window.requestAnimationFrame(function pin() {
      toEnd();
      frame = window.requestAnimationFrame(pin);
    });
    const release = window.setTimeout(
      () => window.cancelAnimationFrame(frame),
      800
    );

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(release);
    };
  }, [floating, lenis]);

  // Written out in full rather than assembled from a constant: Tailwind reads
  // class names out of the source text, and an interpolated one never matches.
  const seal = still
    ? "transition-none"
    : "transition-[padding] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]";
  const cardSeal = still
    ? "transition-none"
    : "transition-[max-width,border-radius] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]";

  return (
    <footer
      ref={ref}
      // Full bleed by default, so the page signs off edge to edge. At the bottom
      // it lifts into a card: a deep foot that holds the floating section nav
      // dock, tight insets either side, and corners. The head keeps its inset in
      // both states, so even the full-bleed panel reads as laid on the page
      // rather than welded to the section above it.
      className={`overflow-x-clip bg-white pt-3 sm:pt-5 ${seal} ${floating ? "px-3 pb-28 sm:px-5 sm:pb-24" : "px-0 pb-0"
        }`}
    >
      {/* A panel inset from every edge rather than a band welded to the bottom of
          the document. The page runs white all the way down to here, so the
          panel is the only dark thing left on it. The image is 16:9 and the card
          is not, so it is cropped to fill — the scrim on top keeps the type
          legible whatever the crop lands on. */}
      <div
        ref={cardRef}
        className={`relative mx-auto w-full overflow-hidden ring-1 ring-black/10 ${cardSeal} ${floating
          ? "max-w-6xl rounded-[1.75rem] sm:rounded-[2.25rem]"
          : "max-w-full rounded-none"
          }`}
      >
        <motion.div
          aria-hidden
          style={still ? undefined : { y: imageDrift }}
          className="absolute inset-x-0 -inset-y-10"
        >
          {profile.footerBackgroundUrl ? (
            <Image
              src={profile.footerBackgroundUrl}
              alt=""
              fill
              sizes="(min-width: 640px) 100vw, 250vw"
              className="object-cover object-center"
            />
          ) : null}
        </motion.div>

        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/80"
        />

        {/* The deep foot of the card is padding, not content: the section nav
            dock floats over the last stretch of the page, and with the panel
            now sitting close to the bottom edge that dock would otherwise land
            on the fine print. */}
        <div className="relative flex flex-col px-6 pt-12 pb-6 sm:min-h-[26rem] sm:px-10 sm:pt-16">
          {/* Name and line sit tight together at the head of the panel, and the
              ways to reach him sit at its foot. Nothing here is set large: this
              is a sign-off, and the section index the panel used to carry
              already lives in the dock that floats over the bottom of the page. */}
          <div>
            <p className="font-mono text-[10px] tracking-[0.25em] text-white/40 uppercase">
              {profile.name}
            </p>

            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/60">
              {profile.footerTagline}
            </p>
          </div>

          {/* The band between the head and the foot is left clear. On a phone
              the panel crops the backdrop hard across its width and the figure in
              that photo stands in the middle of it, so the copy is kept off the
              centre; on a desk the panel is given a floor to sit on, which opens
              the same band under the backdrop. */}
          <div aria-hidden className="min-h-[9rem] flex-1 sm:min-h-0" />

          <ul className="-ml-2 flex flex-wrap gap-1">
            <li>
              <a
                href={`mailto:${profile.email}`}
                aria-label="Email"
                title={profile.email}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/55 transition-colors hover:bg-white/10 hover:text-orange"
              >
                <Mail size={16} />
              </a>
            </li>

            {profile.socials.map((social) => {
              const Icon =
                SOCIAL_ICONS[social.icon] ??
                SOCIAL_ICONS[social.label] ??
                Globe;

              return (
                <li key={social.url}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={social.label}
                    title={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-white/55 transition-colors hover:bg-white/10 hover:text-orange"
                  >
                    <Icon size={16} />
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="text-center font-mono text-[10px] tracking-[0.2em] text-white/35 uppercase">
              &copy; {new Date().getFullYear()} {profile.name}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
