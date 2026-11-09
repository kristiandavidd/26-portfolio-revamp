"use client";

import { ArrowDown, ArrowUp, Check } from "lucide-react";
import { useTransition } from "react";
import { cn } from "@repo/ui";
import type { Entity } from "@/lib/entities";
import { moveItem, setStatus } from "@/lib/actions/order";
import { toggleWishlistItem } from "@/lib/actions/personal";

export function Reorder({
  entity,
  id,
  path,
  scope,
  first,
  last,
}: {
  entity: Entity;
  id: string;
  path: string;
  scope?: string;
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
    if (scope) data.set("scope", scope);
    startTransition(async () => {
      await moveItem(data);
    });
  }

  return (
    <span className="flex items-center gap-0.5">
      <button
        type="button"
        disabled={first || pending}
        aria-label="Move up"
        title="Move up"
        onClick={() => move("up")}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-brand/40 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ArrowUp size={13} aria-hidden />
      </button>
      <button
        type="button"
        disabled={last || pending}
        aria-label="Move down"
        title="Move down"
        onClick={() => move("down")}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-brand/40 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ArrowDown size={13} aria-hidden />
      </button>
    </span>
  );
}

/** Active / inactive, as a button rather than a native checkbox. */
export function StatusToggle({
  entity,
  id,
  status,
  path,
}: {
  entity: Entity;
  id: string;
  status: number;
  path: string;
}) {
  const [pending, startTransition] = useTransition();
  const active = status === 1;

  function toggle() {
    const data = new FormData();
    data.set("entity", entity);
    data.set("id", id);
    data.set("status", active ? "0" : "1");
    data.set("_path", path);
    startTransition(async () => {
      await setStatus(data);
    });
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={active ? "Set inactive" : "Set active"}
      title={active ? "Active — click to hide" : "Inactive — click to publish"}
      onClick={toggle}
      disabled={pending}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 font-mono text-[9px] tracking-[0.12em] uppercase transition-colors disabled:opacity-60",
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-line bg-sand text-muted hover:text-ink",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          active ? "bg-emerald-500" : "bg-muted/50",
        )}
      />
      {active ? "Active" : "Inactive"}
    </button>
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
