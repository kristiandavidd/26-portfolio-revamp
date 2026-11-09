"use client";

import { useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button, cn } from "@repo/ui";
import { Dialog } from "@/components/panel/Dialog";

/**
 * Edit forms live in a modal instead of an accordion: the table stays the
 * page's spine, and a row opens only when it is worked on.
 */
export function Modal({
  triggerLabel,
  triggerVariant = "secondary",
  triggerSize = "sm",
  title,
  description,
  wide = false,
  children,
}: {
  triggerLabel: string;
  triggerVariant?: "primary" | "secondary" | "ghost" | "danger";
  triggerSize?: "sm" | "md";
  title: string;
  description?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant={triggerVariant}
        size={triggerSize}
        onClick={() => setOpen(true)}
      >
        {triggerLabel}
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        label={title}
        className={cn(
          "max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)]",
          wide ? "max-w-4xl" : "max-w-2xl",
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <h2 className="text-base font-semibold text-ink">{title}</h2>
            {description ? (
              <p className="mt-1 text-xs leading-relaxed text-muted">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close dialog"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-brand/40 hover:text-ink"
          >
            <X size={15} aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5">
          {children}
        </div>
      </Dialog>
    </>
  );
}
