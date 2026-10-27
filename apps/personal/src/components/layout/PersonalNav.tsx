"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  Home,
  Images,
  ListChecks,
  MapPin,
  type LucideIcon,
} from "lucide-react";

const LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/story", label: "Story", icon: BookOpen },
  { href: "/places", label: "Places", icon: MapPin },
  { href: "/gallery", label: "Gallery", icon: Images },
  { href: "/wishlist", label: "Wishlist", icon: ListChecks },
];

/**
 * The same dock as the professional site, with the personal destinations.
 * Routes rather than anchors, so the active state comes from the pathname.
 */
export function PersonalNav() {
  const pathname = usePathname();

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 bottom-5 z-50 flex justify-center px-4"
    >
      <nav
        aria-label="Personal navigation"
        className="flex items-center gap-0.5 rounded-full border border-line bg-white/90 p-1.5 shadow-lg backdrop-blur"
      >
        {LINKS.map((link) => {
          const Icon = link.icon;
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-label={link.label}
              aria-current={active ? "page" : undefined}
              title={link.label}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-black/40 transition-colors hover:text-black"
            >
              {active ? (
                <motion.span
                  layoutId="personalNavActive"
                  className="absolute inset-0 rounded-full bg-violet"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              ) : null}
              <Icon
                size={18}
                strokeWidth={2}
                className={`relative z-10 ${active ? "text-white" : ""}`}
              />
            </Link>
          );
        })}
      </nav>
    </motion.div>
  );
}
