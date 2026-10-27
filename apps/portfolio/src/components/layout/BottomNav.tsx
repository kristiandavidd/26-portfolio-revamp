"use client";

import { motion } from "framer-motion";
import { useLenis } from "lenis/react";
import {
  Award,
  Briefcase,
  FolderKanban,
  Home,
  User,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * The five anchors the dock offers, in the order they appear on the page.
 * Dephilia and Community are deliberately not here: they belong to a listed
 * anchor rather than standing on their own. Dephilia is part of the work, so it
 * reads as Projects, and Community sits with the credentials, so it reads as
 * Certifications.
 */
const SECTIONS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "hero", label: "Home", icon: Home },
  { id: "about", label: "About", icon: User },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "certifications", label: "Certifications", icon: Award },
];

// Fraction down the viewport that counts as the "active line". A section
// becomes active once its top crosses above this line; this works regardless
// of how tall a section is, unlike ratio-based IntersectionObserver checks.
const ACTIVE_LINE = 0.35;

export function BottomNav() {
  const [active, setActive] = useState(SECTIONS[0].id);
  const activeRef = useRef(SECTIONS[0].id);
  const lenis = useLenis();

  useEffect(() => {
    const measure = () => {
      const line = window.innerHeight * ACTIVE_LINE;
      let current = SECTIONS[0].id;

      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= line) current = section.id;
      }

      if (current === activeRef.current) return;
      activeRef.current = current;
      setActive(current);
    };

    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenis) {
      lenis.scrollTo(el, {
        offset: id === SECTIONS[0].id ? 0 : -24,
        duration: 1.2,
      });
    } else {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      aria-label="Section navigation"
      className="flex items-center gap-0.5 rounded-full border border-line bg-white/90 p-1.5 shadow-lg backdrop-blur"
    >
      {SECTIONS.map((section) => {
        const Icon = section.icon;
        const isActive = active === section.id;
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => scrollTo(section.id)}
            aria-label={section.label}
            aria-current={isActive}
            title={section.label}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-black/40 transition-colors hover:text-black"
          >
            {isActive ? (
              <motion.span
                layoutId="bottomNavActive"
                className="absolute inset-0 rounded-full bg-orange"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            ) : null}
            <Icon
              size={18}
              strokeWidth={2}
              className={`relative z-10 ${isActive ? "text-white" : ""}`}
            />
          </button>
        );
      })}
    </nav>
  );
}
