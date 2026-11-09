"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@repo/ui";

/**
 * One overlay for every dialog in the panel. It renders into <body> so a
 * `transform` on an ancestor (the page-in animation) can never trap it, and the
 * backdrop always covers the whole viewport instead of the page container.
 */
export function Dialog({
  open,
  onClose,
  label,
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[95] overflow-y-auto overscroll-contain">
      <div
        aria-hidden
        onClick={onClose}
        className="fixed inset-0 bg-ink/60 backdrop-blur-sm"
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-6">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={label}
          className={cn(
            "relative flex w-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl",
            className,
          )}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
