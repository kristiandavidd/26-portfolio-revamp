"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useLenis } from "lenis/react";
import { Container } from "@/components/ui/Container";
import { profile } from "@/data/profile";
import { useDepthY } from "@/components/ui/depth";

const NAV = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "certifications", label: "Certifications" },
  { id: "contact", label: "Contact" },
];

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const still = useReducedMotion();
  const lenis = useLenis();
  const words = profile.name.trim().split(/\s+/);
  const hasEmail = profile.email.length > 0;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // The nav runs ahead of the page and the fine print lags, so the footer opens
  // in depth instead of sliding up as one slab. The wordmark is a curtain: it
  // is masked and lifts from below its own box, which is why it moves by a
  // percentage rather than a distance.
  const navY = useDepthY(scrollYProgress, "foreground", 120);
  const metaY = useDepthY(scrollYProgress, "subject", 120);
  const nameLift = useTransform(scrollYProgress, [0, 0.5], ["58%", "0%"]);

  const goTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenis) {
      lenis.scrollTo(el, { offset: -24, duration: 1.2 });
    } else {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer
      ref={ref}
      className="relative overflow-x-clip bg-black pb-32 text-white sm:pb-36"
    >
      <Container className="pt-4">
        <motion.div
          style={still ? undefined : { y: metaY }}
          className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between"
        >
          <div>
            <p className="font-mono text-[10px] tracking-[0.25em] text-white/35 uppercase">
              {profile.name}
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/55">
              Fullstack engineer building web products end to end. If something
              here looks like the kind of thing you need, say hello.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {hasEmail ? (
              <a
                href={`mailto:${profile.email}`}
                className="text-sm text-white/80 underline decoration-white/20 underline-offset-4 transition-colors hover:text-orange hover:decoration-orange"
              >
                {profile.email}
              </a>
            ) : null}
            {profile.socials.length > 0 ? (
              <ul className="flex flex-wrap gap-x-5 gap-y-2">
                {profile.socials.map((social) => (
                  <li key={social.url}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-sm text-white/60 transition-colors hover:text-orange"
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </motion.div>

        {/* The index is the footer's main content, so it is set as type rather
            than as a row of small buttons. The accent wipes in from the left on
            hover — the one loud gesture in an otherwise quiet block. */}
        <motion.nav
          aria-label="Footer"
          style={still ? undefined : { y: navY }}
          className="mt-14 border-b border-white/10"
        >
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(item.id)}
              className="group relative flex w-full items-center gap-5 border-t border-white/10 py-5 text-left sm:gap-10"
            >
              <span
                aria-hidden
                className="absolute inset-0 origin-left scale-x-0 bg-orange transition-transform duration-500 ease-out group-hover:scale-x-100"
              />
              <span className="font-display relative flex-1 text-2xl uppercase transition-colors group-hover:text-black sm:text-4xl">
                {item.label}
              </span>
              <span
                aria-hidden
                className="relative text-white/30 transition-all duration-500 group-hover:translate-x-1 group-hover:text-black"
              >
                &rarr;
              </span>
            </button>
          ))}
        </motion.nav>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[10px] tracking-[0.2em] text-white/35 uppercase">
            &copy; {new Date().getFullYear()} {profile.name}. All rights
            reserved.
          </p>
          <div className="flex items-center gap-6">
            <p className="font-mono text-[10px] tracking-[0.2em] text-white/35 uppercase">
              Built with Next.js
            </p>
            <button
              type="button"
              onClick={() => goTo("hero")}
              className="font-mono text-[10px] tracking-[0.2em] text-white/50 uppercase transition-colors hover:text-orange"
            >
              Back to top &uarr;
            </button>
          </div>
        </div>
      </Container>

      {/* Masked, so the name lifts into view rather than simply being there. It
          runs past the container on purpose: this is the last thing on the
          page, so it is allowed to behave like a printed edge. */}
      <div aria-hidden className="mt-12 overflow-hidden px-6 sm:px-8">
        <motion.span
          style={still ? undefined : { y: nameLift }}
          className="font-display block text-[16vw] leading-[0.78] text-white/[0.12] uppercase select-none lg:text-[10rem]"
        >
          {words.map((word) => (
            <span key={word} className="block">
              {word}
            </span>
          ))}
        </motion.span>
      </div>
    </footer>
  );
}
