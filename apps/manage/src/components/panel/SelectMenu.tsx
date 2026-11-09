"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@repo/ui";

export type SelectOption = { value: string; label: string };

/**
 * A styled listbox that posts through a hidden input, so forms keep working
 * without the browser's native select chrome.
 */
export function SelectMenu({
  id,
  name,
  defaultValue = "",
  options,
  placeholder = "Select…",
  className,
}: {
  id?: string;
  name: string;
  defaultValue?: string;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = options.find((option) => option.value === value);

  return (
    <div ref={root} className={cn("relative", className)}>
      <input type="hidden" name={name} value={value} />

      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((state) => !state)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-left text-sm text-ink transition-colors focus:border-brand focus:ring-2 focus:ring-brand/15 focus:outline-none"
      >
        <span className={cn("truncate", !current && "text-muted/70")}>
          {current?.label ?? placeholder}
        </span>
        <ChevronDown
          size={14}
          aria-hidden
          className={cn(
            "shrink-0 text-muted transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          className="absolute z-40 mt-1.5 max-h-64 w-full overflow-y-auto rounded-xl border border-line bg-surface p-1 shadow-xl"
        >
          {options.length === 0 ? (
            <li className="px-3 py-2 text-xs text-muted">No options</li>
          ) : null}

          {options.map((option) => {
            const selected = option.value === value;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    setValue(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    selected
                      ? "bg-brand/10 text-brand"
                      : "text-ink/80 hover:bg-paper",
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {selected ? <Check size={13} aria-hidden /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
