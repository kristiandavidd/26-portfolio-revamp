"use client";

import { useEffect, type ReactNode } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";

/**
 * A route change swaps the document under a running scroll controller, and Lenis
 * then re-applies its own target position to whatever page has just arrived —
 * which is why a case could open at the bottom when the previous page was left
 * there. Every route starts at the top instead, reset as soon as the new
 * document is committed. It also runs on the first mount, so a reload lands at
 * the top rather than wherever the browser last left the reader.
 */
function ScrollReset() {
  const lenis = useLenis();
  const pathname = usePathname();

  useEffect(() => {
    if (lenis) {
      // Measured first: the new document is a different height, and Lenis clamps
      // every target to the height it has cached.
      lenis.resize();
      lenis.scrollTo(0, { immediate: true });
      return;
    }

    window.scrollTo(0, 0);
  }, [pathname, lenis]);

  return null;
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
        touchMultiplier: 1.2,
      }}
    >
      <ScrollReset />
      {children}
    </ReactLenis>
  );
}
