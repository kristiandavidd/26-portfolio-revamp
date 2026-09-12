"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import pattern1 from "../../../public/images/hero-pattern-1.png";
import pattern2 from "../../../public/images/hero-pattern-2.png";
import pattern3 from "../../../public/images/hero-pattern-3.png";
import pattern4 from "../../../public/images/hero-pattern-4.png";
import portrait from "../../../public/images/hero-portrait.png";

const PATTERNS = [pattern1, pattern2, pattern3, pattern4];

// Hard cut between patterns: no cross-fade, just fast successive swaps.
// 350ms keeps the swap rate just under 3 per second (WCAG 2.3.1) instead of strobing.
const INTERVAL_MS = 350;

const PORTRAIT_SIZES = "(min-width: 1024px) 832px, 100vw";
const PATTERN_SIZES = "(min-width: 1024px) 1536px, 150vw";

export function HeroVisual() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % PATTERNS.length);
    }, INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full">
      {/* Scaled past the portrait and pinned to the bottom, so the framing of
          the pattern encloses the portrait instead of sitting inside it. */}
      {PATTERNS.map((pattern, i) => (
        <div
          key={pattern.src}
          className={`absolute bottom-0 left-1/2 w-[150%] -translate-x-1/2 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={pattern}
            alt=""
            loading={i === 0 ? "eager" : "lazy"}
            sizes={PATTERN_SIZES}
            className="h-auto w-full"
          />
        </div>
      ))}

      {/* The portrait stays in normal flow, so it defines the artwork height. */}
      <Image
        src={portrait}
        alt="Portrait"
        loading="eager"
        sizes={PORTRAIT_SIZES}
        className="relative z-10 h-auto w-full"
      />
    </div>
  );
}
