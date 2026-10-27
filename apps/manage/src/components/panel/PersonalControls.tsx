"use client";

import { ArrowDown, ArrowUp, Check } from "lucide-react";
import { useTransition } from "react";
import {
  movePersonalItem,
  toggleWishlistItem,
} from "@/lib/actions/personal";
import { cn } from "@repo/ui";

export function Reorder({
  entity,
  id,
  path,
  first,
  last,
}: {
  entity: "story" | "place" | "gallery" | "wishlist";
  id: string;
  path: string;
  first: boolean;
  last: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function move(direction: "up" | "down") {
    const data = new FormData();
    data.set("entity", entity);
    data.set("id", id);
    data.set("direction", direction);
    data.set("_path", path);
    startTransition(async () => {
      await movePersonalItem(data);
    });
  }

  return (
    <span className="flex items-center gap-1">
      <button
        type="button"
        disabled={first || pending}
        aria-label="Move up"
        title="Move up"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          move("up");
        }}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-brand/40 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ArrowUp size={13} aria-hidden />
      </button>
      <button
        type="button"
        disabled={last || pending}
        aria-label="Move down"
        title="Move down"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          move("down");
        }}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-brand/40 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ArrowDown size={13} aria-hidden />
      </button>
    </span>
  );
}

export function WishlistToggle({
  id,
  done,
  path,
}: {
  id: string;
  done: boolean;
  path: string;
}) {
  const [pending, startTransition] = useTransition();

  function toggle() {
    const data = new FormData();
    data.set("id", id);
    data.set("_path", path);
    startTransition(async () => {
      await toggleWishlistItem(data);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={done}
      aria-label={done ? "Mark as not done" : "Mark as done"}
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
        done
          ? "border-brand bg-brand text-white"
          : "border-line text-transparent hover:border-brand/50",
      )}
    >
      <Check size={13} aria-hidden />
    </button>
  );
}
