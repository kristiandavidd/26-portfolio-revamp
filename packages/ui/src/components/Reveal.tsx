"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Keeps its children visible at all times, but blurred until they scroll into
 * view, then sharpens them. Nothing is ever hidden from the reader.
 */
export function Reveal({ children, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setFocused(true);
        observer.disconnect();
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-[filter] duration-1000 ease-out motion-reduce:transition-none ${
        focused ? "blur-[0px]" : "blur-sm"
      } ${className}`.trim()}
    >
      {children}
    </div>
  );
}
