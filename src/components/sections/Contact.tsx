"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Container } from "@/components/ui/Container";
import { profile } from "@/data/profile";
import { EASE_STOPS, easedRange, useDepthY } from "@/components/ui/depth";

export function Contact() {
  const ref = useRef<HTMLElement>(null);
  const still = useReducedMotion();
  const hasEmail = profile.email.length > 0;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // The headline rises out of a mask, the address rises further and scales up.
  // Three planes, front to back, so the block assembles in depth as it arrives
  // rather than fading in as a single sheet. Nothing is pinned: pinning traps a
  // section in a viewport-high box, which is exactly what this page should not
  // do again.
  const ghostY = useDepthY(scrollYProgress, "atmosphere", 340);
  const headY = useDepthY(scrollYProgress, "subject", 150);
  const headOpacity = useTransform(scrollYProgress, [0, 0.22], [0.15, 1]);
  const mailY = useDepthY(scrollYProgress, "foreground", 150);
  const mailScale = useTransform(
    scrollYProgress,
    EASE_STOPS,
    easedRange(0.88, 1)
  );
  const ruleScale = useTransform(scrollYProgress, [0.18, 0.5], [0, 1]);
  const metaOpacity = useTransform(scrollYProgress, [0.26, 0.5], [0, 1]);

  return (
    <section
      ref={ref}
      id="contact"
      className="relative scroll-mt-24 overflow-x-clip bg-black text-white"
    >
      {/* Certifications and the sections under it are white, so the top of this
          section ramps from that same white into the black. Mirror of the
          hand-off above, which keeps both seams reading as one surface. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[28vh]"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, var(--color-white) 0%, color-mix(in srgb, var(--color-white) 45%, transparent) 45%, transparent 100%)",
        }}
      />

      <motion.span
        aria-hidden
        style={still ? undefined : { y: ghostY }}
        className="font-display pointer-events-none absolute inset-x-0 top-[46%] text-center text-[24vw] leading-none whitespace-nowrap text-white/[0.05] uppercase select-none"
      >
        Contact
      </motion.span>

      <Container className="relative pt-[32vh] pb-16 sm:pb-24">
        {/* The mask is the reveal: the headline starts fully below its own box
            and rises into it, so the type arrives rather than fades. */}
        <div className="overflow-hidden">
          <motion.h2
            style={still ? undefined : { y: headY, opacity: headOpacity }}
            className="font-display text-[17vw] leading-[0.92] uppercase sm:text-[12vw] lg:text-[9rem]"
          >
            Say hello
          </motion.h2>
        </div>

        <div className="mt-10 flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <p className="max-w-lg text-base leading-relaxed text-white/60">
            Got something you want built? Tell me about it — a product, a role,
            or just an idea you are still chewing on. I read everything and I
            reply.
          </p>

          <div className="flex flex-col items-start gap-8">
            {hasEmail ? (
              <motion.a
                style={still ? undefined : { y: mailY, scale: mailScale }}
                href={`mailto:${profile.email}`}
                className="group block origin-left"
              >
                <span className="font-mono text-[10px] tracking-[0.25em] text-white/35 uppercase">
                  Email
                </span>
                <span className="mt-3 block text-2xl tracking-tight break-all text-white transition-colors group-hover:text-orange sm:text-4xl lg:text-5xl">
                  {profile.email}
                </span>
                <motion.span
                  aria-hidden
                  style={still ? undefined : { scaleX: ruleScale }}
                  className="mt-5 block h-px origin-left bg-white/30 transition-colors group-hover:bg-orange"
                />
              </motion.a>
            ) : (
              <span className="font-mono text-sm tracking-[0.2em] text-white/35 uppercase">
                [ email pending ]
              </span>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={hasEmail ? `mailto:${profile.email}` : "#contact"}
                className="inline-flex items-center gap-2 bg-orange px-6 py-3 font-mono text-[11px] tracking-[0.15em] text-black uppercase transition-colors hover:bg-white"
              >
                Start a conversation
                <span aria-hidden>&rarr;</span>
              </a>
              <Link
                href="/#projects"
                className="inline-flex items-center gap-2 border-b border-white/30 pb-1 font-mono text-[11px] tracking-[0.15em] text-white/70 uppercase transition-colors hover:border-white hover:text-white"
              >
                See the work
              </Link>
            </div>
          </div>
        </div>

        <motion.dl
          style={still ? undefined : { opacity: metaOpacity }}
          className="mt-16 grid gap-8 border-t border-white/10 pt-8 sm:grid-cols-3"
        >
          <div>
            <dt className="font-mono text-[10px] tracking-[0.25em] text-white/35 uppercase">
              Based in
            </dt>
            <dd className="mt-2 text-sm text-white/70">
              {profile.location || "Semarang, Indonesia"}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] tracking-[0.25em] text-white/35 uppercase">
              Focus
            </dt>
            <dd className="mt-2 text-sm text-white/70">
              Fullstack web — Laravel, Next.js, React
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] tracking-[0.25em] text-white/35 uppercase">
              Elsewhere
            </dt>
            <dd className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-white/70">
              {profile.socials.length > 0 ? (
                profile.socials.map((social) => (
                  <a
                    key={social.url}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="transition-colors hover:text-orange"
                  >
                    {social.label}
                  </a>
                ))
              ) : (
                <span className="font-mono text-[11px] tracking-[0.2em] text-white/30 uppercase">
                  [ links pending ]
                </span>
              )}
            </dd>
          </div>
        </motion.dl>
      </Container>
    </section>
  );
}
