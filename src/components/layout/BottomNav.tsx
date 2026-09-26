"use client";

import { motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import {
  Award,
  BookOpen,
  Briefcase,
  Brush,
  FolderKanban,
  Heart,
  Home,
  Sprout,
  Sun,
  User,
  type LucideIcon,
} from "lucide-react";
import { useRef, useState } from "react";

/**
 * Both personalities point at the same five anchors, so the nav can travel
 * between them unchanged. What changes is the mark on each one: the warm side
 * gets its own set rather than a recoloured technical one, because a different
 * personality should not be saying the same things in the same voice.
 */
const SECTIONS: {
  id: string;
  label: string;
  technical: LucideIcon;
  personal: LucideIcon;
}[] = [
  { id: "hero", label: "Home", technical: Home, personal: Sun },
  { id: "about", label: "About", technical: User, personal: Heart },
  {
    id: "experience",
    label: "Experience",
    technical: Briefcase,
    personal: Sprout,
  },
  {
    id: "projects",
    label: "Projects",
    technical: FolderKanban,
    personal: Brush,
  },
  {
    id: "certifications",
    label: "Certifications",
    technical: Award,
    personal: BookOpen,
  },
];

// Fraction down the viewport that counts as the "active line". A section
// becomes active once its top crosses above this line; this works
// regardless of how tall a section is, unlike ratio-based IntersectionObserver checks.
const ACTIVE_LINE = 0.35;

/**
 * Sits inside BottomBar's row, so it carries no positioning of its own. It does
 * carry the palette attribute: the layout renders it, which puts it outside the
 * personal page's wrapper, and without this it would stay orange on a violet
 * page.
 */
export function BottomNav() {
  const pathname = usePathname();
  const personal = pathname.startsWith("/personal");
  const [active, setActive] = useState(SECTIONS[0].id);
  const activeRef = useRef(SECTIONS[0].id);

  const lenis = useLenis(() => {
    const line = window.innerHeight * ACTIVE_LINE;
    let current = SECTIONS[0].id;
    for (const section of SECTIONS) {
      const el = document.getElementById(section.id);
      if (!el) continue;
      if (el.getBoundingClientRect().top <= line) {
        current = section.id;
      }
    }
    if (current !== activeRef.current) {
      activeRef.current = current;
      setActive(current);
    }
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
      data-theme={personal ? "personal" : undefined}
      aria-label="Section navigation"
      className="flex items-center gap-0.5 rounded-full border border-line bg-white/90 p-1.5 shadow-lg backdrop-blur"
    >
      {SECTIONS.map((section) => {
        const Icon = personal ? section.personal : section.technical;
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
