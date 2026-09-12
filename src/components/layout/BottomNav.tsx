"use client";

import { motion } from "framer-motion";
import { useLenis } from "lenis/react";
import {
  Award,
  Briefcase,
  FolderKanban,
  Home,
  Mail,
  User,
} from "lucide-react";
import { useRef, useState } from "react";

const LINKS = [
  { id: "hero", label: "Home", icon: Home },
  { id: "about", label: "About", icon: User },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "certifications", label: "Certifications", icon: Award },
  { id: "contact", label: "Contact", icon: Mail },
];

// Fraction down the viewport that counts as the "active line". A section
// becomes active once its top crosses above this line; this works
// regardless of how tall a section is, unlike ratio-based IntersectionObserver checks.
const ACTIVE_LINE = 0.35;

export function BottomNav() {
  const [active, setActive] = useState(LINKS[0].id);
  const activeRef = useRef(LINKS[0].id);

  const lenis = useLenis(() => {
    const line = window.innerHeight * ACTIVE_LINE;
    let current = LINKS[0].id;
    for (const link of LINKS) {
      const el = document.getElementById(link.id);
      if (!el) continue;
      if (el.getBoundingClientRect().top <= line) {
        current = link.id;
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
      lenis.scrollTo(el, { offset: id === LINKS[0].id ? 0 : -24, duration: 1.2 });
    } else {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.nav
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 bottom-5 z-50 flex justify-center px-4"
      aria-label="Section navigation"
    >
      <div className="flex items-center gap-0.5 rounded-full border border-line bg-white/90 p-1.5 shadow-lg backdrop-blur">
        {LINKS.map((link) => {
          const Icon = link.icon;
          const isActive = active === link.id;
          return (
            <button
              key={link.id}
              type="button"
              onClick={() => scrollTo(link.id)}
              aria-label={link.label}
              aria-current={isActive}
              title={link.label}
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
      </div>
    </motion.nav>
  );
}
