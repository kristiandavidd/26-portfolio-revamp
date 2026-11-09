"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { cn } from "@repo/ui";
import type { Flash } from "@/lib/flash";
import { dismissFlash } from "@/lib/actions/flash";

export function FlashToast({ flash }: { flash: Flash | null }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!flash) return;

    // Clearing the cookie re-renders this layout, so wait until the toast is
    // already hidden — otherwise it would vanish the moment it appears.
    const timer = window.setTimeout(() => {
      setVisible(false);
      void dismissFlash();
    }, 4800);
    return () => window.clearTimeout(timer);
  }, [flash]);

  function dismiss() {
    setVisible(false);
    void dismissFlash();
  }

  if (!flash || !visible) return null;

  const error = flash.tone === "error";
  const Icon = error ? AlertTriangle : CheckCircle2;

  return (
    <div
      role={error ? "alert" : "status"}
      className="fixed top-5 right-4 z-[100] flex w-[min(22rem,calc(100vw-2rem))] items-start gap-3 overflow-hidden rounded-2xl border border-line bg-surface p-4 shadow-[0_24px_60px_-24px_rgba(10,10,10,0.35)] sm:top-6 sm:right-6"
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 w-1",
          error ? "bg-red-500" : "bg-brand",
        )}
      />
      <span
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          error ? "bg-red-50 text-red-600" : "bg-brand/10 text-brand",
        )}
      >
        <Icon size={15} aria-hidden />
      </span>

      <p className="min-w-0 flex-1 text-sm leading-relaxed text-ink/85">
        {flash.message}
      </p>

      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="rounded-full p-1 text-muted transition-colors hover:bg-sand hover:text-ink"
      >
        <X size={14} aria-hidden />
      </button>
    </div>
  );
}
