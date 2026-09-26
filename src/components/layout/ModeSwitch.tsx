"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Code2, Coffee, Palette, X, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

// Two personalities, two routes. This is not a palette swap on one page: the
// personal side is its own canvas with its own content, so the switch is a
// navigation, and this control reads the route rather than remembering a choice.
//
// Neither option is ever drawn as the current one. A selected state would put
// the emphasis on the move itself, and the point is that the switch should feel
// like the page changed colour in place — so the accent is the only thing that
// differs between the two sides, and it comes from the route.
const MODES: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Technical portfolio", icon: Code2 },
  { href: "/personal", label: "The personal side", icon: Coffee },
];

export function ModeSwitch() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const personal = pathname.startsWith("/personal");

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    // Last item in BottomBar's row, so it is a sibling of the section nav rather
    // than something floating over it. Same 6px padding and 40px control as that
    // nav, which is what puts both on one baseline.
    // It carries the palette attribute itself: the layout renders it, so it sits
    // outside the personal page's wrapper and would otherwise keep the technical
    // colours on a cream page.
    <div data-theme={personal ? "personal" : undefined} className="relative">
      <AnimatePresence>
        {open ? (
          <div className="absolute right-0 bottom-full mb-3 flex flex-col items-center gap-2">
            {MODES.map((item, index) => {
              const Icon = item.icon;
              const isCurrent = item.href === (personal ? "/personal" : "/");
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 20, scale: 0.6 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 14, scale: 0.6 }}
                  transition={{
                    // Nearest option first, so the stack grows out of the
                    // circle instead of appearing whole.
                    delay: (MODES.length - 1 - index) * 0.06,
                    type: "spring",
                    stiffness: 420,
                    damping: 30,
                  }}
                >
                  {/* Same 6px padding plus 40px control as the trigger, so an
                      option is exactly the size of the button it came out of. */}
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-label={item.label}
                    aria-current={isCurrent ? "page" : undefined}
                    title={item.label}
                    className="flex rounded-full border border-line bg-white/90 p-1.5 text-black/45 shadow-lg backdrop-blur transition-colors hover:text-black"
                  >
                    <span className="flex h-10 w-10 items-center justify-center">
                      <Icon size={18} strokeWidth={2} aria-hidden />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : null}
      </AnimatePresence>

      <div className="rounded-full border border-line bg-white/90 p-1.5 shadow-lg backdrop-blur">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close" : "Switch personality"}
          aria-expanded={open}
          title="Switch personality"
          className="flex h-10 w-10 items-center justify-center rounded-full text-black/40 transition-colors hover:text-black"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? "close" : "palette"}
              initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.18 }}
              className="flex"
            >
              {open ? (
                <X size={18} strokeWidth={2} aria-hidden />
              ) : (
                <Palette size={18} strokeWidth={2} aria-hidden />
              )}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}
