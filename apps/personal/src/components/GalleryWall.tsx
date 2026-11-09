"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  ChevronRight,
  ImageOff,
  RotateCcw,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { PersonalGalleryView } from "@repo/db";

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const SWIPE_DISTANCE = 60;

export function GalleryWall({ items }: { items: PersonalGalleryView[] }) {
  const [active, setActive] = useState<number | null>(null);
  const [scale, setScale] = useState(MIN_SCALE);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);

  function clampOffset(next: { x: number; y: number }, atScale = scale) {
    const frame = frameRef.current;
    if (!frame) return next;

    const rect = frame.getBoundingClientRect();
    const maxX = (rect.width * (atScale - 1)) / 2;
    const maxY = (rect.height * (atScale - 1)) / 2;

    return {
      x: Math.max(-maxX, Math.min(maxX, next.x)),
      y: Math.max(-maxY, Math.min(maxY, next.y)),
    };
  }

  const resetZoom = useCallback(() => {
    setScale(MIN_SCALE);
    setOffset({ x: 0, y: 0 });
  }, []);

  const close = useCallback(() => {
    resetZoom();
    setActive(null);
  }, [resetZoom]);

  const step = useCallback(
    (delta: number) => {
      resetZoom();
      setActive((current) => {
        if (current === null) return current;
        return (current + delta + items.length) % items.length;
      });
    },
    [items.length, resetZoom],
  );

  function openAt(index: number) {
    resetZoom();
    setActive(index);
  }

  function zoomTo(next: number) {
    const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
    setScale(clamped);
    setOffset((current) =>
      clamped === MIN_SCALE ? { x: 0, y: 0 } : clampOffset(current, clamped),
    );
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("button")) return;
    if (dragRef.current) return;

    const startedAt = {
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
      moved: false,
    };
    dragRef.current = startedAt;
    setDragging(true);

    // Window listeners instead of pointer capture: capturing would retarget the
    // click event and close the viewer when the photo itself is clicked.
    const onMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startedAt.startX;
      const dy = moveEvent.clientY - startedAt.startY;

      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) startedAt.moved = true;

      // Zoomed in: drag pans the photo. At 1x, the same gesture becomes a swipe.
      if (scale > MIN_SCALE) {
        setOffset(
          clampOffset({ x: startedAt.originX + dx, y: startedAt.originY + dy }),
        );
      }
    };

    const onEnd = (endEvent: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);

      dragRef.current = null;
      setDragging(false);

      if (startedAt.moved) suppressClickRef.current = true;

      const dx = endEvent.clientX - startedAt.startX;
      const dy = endEvent.clientY - startedAt.startY;

      if (
        scale === MIN_SCALE &&
        Math.abs(dx) > SWIPE_DISTANCE &&
        Math.abs(dx) > Math.abs(dy)
      ) {
        step(dx < 0 ? 1 : -1);
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
  }

  function onEmptyClick(event: React.MouseEvent<HTMLDivElement>) {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    if (event.target === event.currentTarget) close();
  }

  const current = active === null ? null : items[active];

  useEffect(() => {
    if (active === null) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
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
  }, [active, close, step]);

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
              onClick={() => openAt(index)}
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

      {current && typeof document !== "undefined"
        ? createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
            onClick={onEmptyClick}
            className="fixed inset-0 z-[120] flex flex-col bg-black/95 px-4 pt-4 backdrop-blur-sm sm:px-8 sm:pt-8"
          >
            <div className="flex shrink-0 items-center justify-between gap-3">
              <p className="hidden shrink-0 font-mono text-[10px] tracking-[0.2em] text-white/50 uppercase sm:block">
                {(active ?? 0) + 1} / {items.length}
              </p>

              <div className="flex min-w-0 flex-1 items-baseline justify-center gap-2.5 sm:gap-3">
                {current.year ? (
                  <span className="shrink-0 font-mono text-[9px] tracking-[0.2em] text-white uppercase">
                    {current.year}
                  </span>
                ) : null}
                <span className="truncate text-sm font-medium text-white sm:text-base">
                  {current.title || "Untitled"}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => zoomTo(scale - 0.5)}
                  disabled={scale <= MIN_SCALE}
                  aria-label="Zoom out"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-violet hover:text-violet disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ZoomOut size={15} aria-hidden />
                </button>
                <span className="hidden w-9 text-center font-mono text-[10px] text-white/50 sm:block">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => zoomTo(scale + 0.5)}
                  disabled={scale >= MAX_SCALE}
                  aria-label="Zoom in"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-violet hover:text-violet disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ZoomIn size={15} aria-hidden />
                </button>
                {scale > MIN_SCALE ? (
                  <button
                    type="button"
                    onClick={resetZoom}
                    aria-label="Reset zoom"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-violet hover:text-violet"
                  >
                    <RotateCcw size={14} aria-hidden />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close photo viewer"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-violet hover:text-violet"
                >
                  <X size={15} aria-hidden />
                </button>
              </div>
            </div>

            <div
              ref={frameRef}
              onPointerDown={onPointerDown}
              onClick={onEmptyClick}
              onDragStart={(event) => event.preventDefault()}
              className={`relative mt-4 flex min-h-0 flex-1 touch-none items-center justify-center overflow-hidden select-none ${scale > MIN_SCALE ? "cursor-grab active:cursor-grabbing" : ""
                }`}
            >
              {items.length > 1 ? (
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous photo"
                  className="absolute left-0 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/70 backdrop-blur transition-colors hover:border-violet hover:text-violet"
                >
                  <ChevronLeft size={18} aria-hidden />
                </button>
              ) : null}

              <div
                className="relative h-full w-full max-w-5xl"
                style={{
                  transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
                  transition: dragging ? "none" : "transform 200ms ease-out",
                }}
              >
                {current.image ? (
                  <Image
                    src={current.image.url}
                    alt={current.title || current.note || "Photograph"}
                    fill
                    unoptimized
                    draggable={false}
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
                  className="absolute right-0 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/70 backdrop-blur transition-colors hover:border-violet hover:text-violet"
                >
                  <ChevronRight size={18} aria-hidden />
                </button>
              ) : null}
            </div>

            <div className="shrink-0 px-2 pt-3 pb-10 text-center sm:pb-8">
              {current.note ? (
                <p className="mx-auto max-w-xl text-xs leading-relaxed text-white/50">
                  {current.note}
                </p>
              ) : null}
            </div>
          </div>,
          document.body,
        )
        : null}
    </>
  );
}
