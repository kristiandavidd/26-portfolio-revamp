"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BottomNav } from "./BottomNav";
import { MusicToggle } from "./MusicToggle";

/**
 * The bottom bar, holding the section nav.
 *
 * The personality switch used to sit beside the nav in this same row. It is
 * parked for now: the MVP is the software engineering portfolio, and the
 * personal side is not ready to be reached. The row is kept rather than
 * flattened, because the switch only ever lined up with the nav by being a
 * sibling in a shared centred row — bringing it back means rendering
 * ModeSwitch here again and nothing else.
 *
 * The section nav is kept off the project detail pages, where the anchors it
 * targets do not exist.
 */
export function BottomBar({ musicUrl }: { musicUrl: string | null }) {
  const pathname = usePathname();
  const withNav = pathname === "/";

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 bottom-5 z-50 flex justify-center px-4"
    >
      <div className="flex items-center gap-3">
        {withNav ? <BottomNav /> : null}
        {musicUrl ? <MusicToggle src={musicUrl} /> : null}
      </div>
    </motion.div>
  );
}
