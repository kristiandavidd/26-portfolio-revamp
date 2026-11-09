"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff, X } from "lucide-react";
import type { PersonalGalleryView } from "@repo/db";

export function GalleryWall({ items }: { items: PersonalGalleryView[] }) {
  const [active, setActive] = useState<number | null>(null);

  const step = useCallback(
    (delta: number) => {
      setActive((current) => {
        if (current === null) return current;
        return (current + delta + items.length) % items.length;
      });
    },
    [items.length],
  );

  useEffect(() => {
    if (active === null) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [active, step]);

  const current = active === null ? null : items[active];

  return (
    <>
      <div className="mt-14 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {items.map((item, index) => {
          const ratio =
            item.image?.width && item.image.height
              ? `${item.image.width} / ${item.image.height}`
              : undefined;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(index)}
              className="group mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-line bg-sand text-left"
            >
              <span
                className="relative block w-full"
                style={ratio ? { aspectRatio: ratio } : { aspectRatio: "4 / 3" }}
              >
                {item.image ? (
                  <Image
                    src={item.image.url}
                    alt={item.title || item.note || "Photograph"}
                    fill
                    unoptimized
                    priority={index === 0}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center bg-violet/[0.05] text-violet/50">
                    <ImageOff size={24} aria-hidden />
                  </span>
                )}

                {/* Caption only on hover, so the wall stays quiet. */}
                {item.title || item.year ? (
                  <>
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                    />
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-2 items-end justify-between gap-3 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">
                        {item.title || "Untitled"}
                      </span>
                      {item.year ? (
                        <span className="shrink-0 rounded-full border border-white/25 bg-black/40 px-2.5 py-1 font-mono text-[9px] tracking-[0.16em] text-white uppercase backdrop-blur-sm">
                          {item.year}
                        </span>
                      ) : null}
                    </span>
                  </>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      {current ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 z-[90] flex flex-col bg-black/95 p-4 backdrop-blur-sm sm:p-8"
        >
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] tracking-[0.2em] text-white/50 uppercase">
              {(active ?? 0) + 1} / {items.length}
            </p>
            <button
              type="button"
              onClick={() => setActive(null)}
              aria-label="Close photo viewer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-violet hover:text-violet"
            >
              <X size={16} aria-hidden />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center gap-2 py-4 sm:gap-4">
            {items.length > 1 ? (
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous photo"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-violet hover:text-violet"
              >
                <ChevronLeft size={18} aria-hidden />
              </button>
            ) : null}

            <div className="relative h-full w-full max-w-5xl">
              {current.image ? (
                <Image
                  src={current.image.url}
                  alt={current.title || current.note || "Photograph"}
                  fill
                  unoptimized
                  sizes="90vw"
                  className="object-contain"
                />
              ) : null}
            </div>

            {items.length > 1 ? (
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next photo"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-violet hover:text-violet"
              >
                <ChevronRight size={18} aria-hidden />
              </button>
            ) : null}
          </div>

          <div className="mx-auto max-w-2xl pb-1 text-center">
            {current.year ? (
              <p className="font-mono text-[9px] tracking-[0.2em] text-violet uppercase">
                {current.year}
              </p>
            ) : null}
            <p className="font-display mt-2 text-2xl text-white">
              {current.title || "Untitled"}
            </p>
            {current.note ? (
              <p className="mt-1 text-sm leading-relaxed text-white/60">
                {current.note}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
