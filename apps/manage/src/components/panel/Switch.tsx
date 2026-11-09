"use client";

import { useState } from "react";
import { cn } from "@repo/ui";

/**
 * A boolean that reads as a switch rather than a browser checkbox. The posted
 * value stays in a hidden input, so the server action is unchanged.
 */
export function Switch({
  name,
  label,
  hint,
  defaultChecked = false,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultChecked?: boolean;
}) {
  const [on, setOn] = useState(defaultChecked);

  return (
    <div className="flex items-center gap-3">
      <input type="hidden" name={name} value={on ? "1" : ""} />
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => setOn((state) => !state)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors",
          on ? "border-brand bg-brand" : "border-line bg-sand",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
            on ? "translate-x-6" : "translate-x-1",
          )}
        />
      </button>
      <span className="min-w-0">
        <span className="block text-sm text-ink/80">{label}</span>
        {hint ? (
          <span className="block text-xs leading-relaxed text-muted">{hint}</span>
        ) : null}
      </span>
    </div>
  );
}
