"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { HeroPatternView } from "@repo/db";

// Hard cut between patterns: no cross-fade, just fast successive swaps.
// 350ms keeps the swap rate just under 3 per second (WCAG 2.3.1) instead of strobing.
const INTERVAL_MS = 350;

const PORTRAIT_SIZES = "(min-width: 1024px) 832px, 100vw";
const PATTERN_SIZES = "(min-width: 1024px) 1536px, 150vw";

export function HeroVisual({
  portraitUrl,
  portraitWidth,
  portraitHeight,
  patterns,
}: {
  portraitUrl: string | null;
  portraitWidth: number | null;
  portraitHeight: number | null;
  patterns: HeroPatternView[];
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (patterns.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % patterns.length);
    }, INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [patterns.length]);

  if (!portraitUrl) return null;

  return (
    <div className="relative w-full">
      {patterns.map((pattern, i) => (
        <div
          key={pattern.url}
          className={`absolute bottom-0 left-1/2 w-[150%] -translate-x-1/2 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={pattern.url}
            alt=""
            width={pattern.width ?? 1536}
            height={pattern.height ?? 1536}
            loading="eager"
            sizes={PATTERN_SIZES}
            className="h-auto w-full"
          />
        </div>
      ))}

      <Image
        src={portraitUrl}
        alt="Portrait"
        width={portraitWidth ?? 1200}
        height={portraitHeight ?? 1200}
        loading="eager"
        sizes={PORTRAIT_SIZES}
        className="relative z-10 h-auto w-full"
      />
    </div>
  );
}
