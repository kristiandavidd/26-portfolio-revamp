"use client";

import {
  useEffect,
  useRef,
  useTransition,
  type ReactNode,
  type RefObject,
} from "react";
import type { Entity } from "@/lib/entities";
import { reorderItems } from "@/lib/actions/order";

const BRAND = "var(--color-brand)";

type SortableProps = {
  entity: Entity;
  ids: string[];
  path: string;
  scope?: string;
  className?: string;
  children: ReactNode;
};

/** A table body whose rows can be dragged into a new order. */
export function SortableBody({ className, children, ...rest }: SortableProps) {
  const ref = useRef<HTMLTableSectionElement>(null);
  useSortable({ ...rest, rootRef: ref as RefObject<HTMLElement | null> });

  return (
    <tbody ref={ref} data-sortable className={className}>
      {children}
    </tbody>
  );
}

/** The same behaviour for a plain stack of blocks, e.g. story paragraphs. */
export function SortableStack({ className, children, ...rest }: SortableProps) {
  const ref = useRef<HTMLDivElement>(null);
  useSortable({ ...rest, rootRef: ref as RefObject<HTMLElement | null> });

  return (
    <div ref={ref} data-sortable className={className}>
      {children}
    </div>
  );
}

/**
 * Native drag & drop over the direct children of the container, in the same
 * order as `ids`. The new order is written by one server action, so the arrows
 * stay as a keyboard-friendly fallback.
 */
function useSortable({
  entity,
  ids,
  path,
  scope,
  rootRef,
}: Omit<SortableProps, "children" | "className"> & {
  rootRef: RefObject<HTMLElement | null>;
}) {
  const [, startTransition] = useTransition();
  const idsKey = ids.join("|");

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const order = idsKey ? idsKey.split("|") : [];
    const items = Array.from(root.children).filter(
      (child): child is HTMLElement => child instanceof HTMLElement,
    );

    // A nested sortable region (paragraphs inside a subchapter row) keeps its
    // own drags, and an empty list has nothing to reorder.
    if (items.length !== order.length || items.length < 2) return;

    let dragged: HTMLElement | null = null;
    let target: HTMLElement | null = null;
    let above = false;

    const itemFor = (node: EventTarget | null) => {
      if (!(node instanceof Element)) return null;
      const element: Element = node;
      return (
        items.find((item) => item === element || item.contains(element)) ?? null
      );
    };

    const paint = (item: HTMLElement, isAbove: boolean | null) => {
      const cells = item.matches("tr")
        ? Array.from(item.querySelectorAll<HTMLElement>("td"))
        : [item];
      for (const cell of cells) {
        cell.style.boxShadow =
          isAbove === null
            ? ""
            : `inset 0 ${isAbove ? 2 : -2}px 0 0 ${BRAND}`;
      }
    };

    const reset = () => {
      if (dragged) {
        dragged.style.opacity = "";
        dragged.style.cursor = "grab";
      }
      if (target) paint(target, null);
      dragged = null;
      target = null;
    };

    const onStart = (event: DragEvent) => {
      const source = event.target instanceof Element ? event.target : null;
      if (!source || source.closest("[data-sortable]") !== root) return;

      const item = itemFor(source);
      if (!item) return;

      dragged = item;
      item.style.opacity = "0.4";
      item.style.cursor = "grabbing";
      event.dataTransfer?.setData("text/plain", "");
      if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
    };

    const onOver = (event: DragEvent) => {
      if (!dragged) return;
      event.preventDefault();

      const item = itemFor(event.target);
      if (!item || item === dragged) {
        if (target) paint(target, null);
        target = null;
        return;
      }

      const rect = item.getBoundingClientRect();
      const isAbove = event.clientY < rect.top + rect.height / 2;
      if (item === target && isAbove === above) return;

      if (target) paint(target, null);
      target = item;
      above = isAbove;
      paint(item, isAbove);
      if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    };

    const onLeave = (event: DragEvent) => {
      if (!dragged) return;
      const next = event.relatedTarget;
      if (next instanceof Element && root.contains(next)) return;
      if (target) paint(target, null);
      target = null;
    };

    const onDrop = (event: DragEvent) => {
      if (!dragged) return;
      event.preventDefault();

      const source = dragged;
      const item = itemFor(event.target) ?? target;
      const from = items.indexOf(source);
      const visible = items.indexOf(item ?? source);

      if (!item || from === -1 || visible === -1 || from === visible) {
        reset();
        return;
      }

      const rect = item.getBoundingClientRect();
      const isAbove = event.clientY < rect.top + rect.height / 2;
      reset();

      const next = order.filter((_, index) => index !== from);
      const anchor = next.indexOf(order[visible]);
      next.splice(isAbove ? anchor : anchor + 1, 0, order[from]);

      const data = new FormData();
      data.set("entity", entity);
      data.set("ids", JSON.stringify(next));
      data.set("_path", path);
      if (scope) data.set("scope", scope);

      startTransition(async () => {
        await reorderItems(data);
      });
    };

    const onEnd = () => reset();

    for (const item of items) {
      item.draggable = true;
      item.style.cursor = "grab";
    }

    root.addEventListener("dragstart", onStart);
    root.addEventListener("dragover", onOver);
    root.addEventListener("dragleave", onLeave);
    root.addEventListener("drop", onDrop);
    root.addEventListener("dragend", onEnd);

    return () => {
      root.removeEventListener("dragstart", onStart);
      root.removeEventListener("dragover", onOver);
      root.removeEventListener("dragleave", onLeave);
      root.removeEventListener("drop", onDrop);
      root.removeEventListener("dragend", onEnd);
      for (const item of items) {
        item.draggable = false;
        item.style.cursor = "";
      }
    };
  }, [rootRef, entity, idsKey, path, scope]);
}
