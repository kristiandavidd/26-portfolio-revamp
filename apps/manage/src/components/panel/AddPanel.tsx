import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { Card } from "@repo/ui";

/**
 * A collapsed "add new" panel. The list is the page's main content, so the
 * create form stays out of the way until it is needed — the same pattern the
 * dashboard uses for secondary actions.
 */
export function AddPanel({
  title,
  description,
  trailing,
  children,
}: {
  title: string;
  description?: string;
  trailing?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-ink">{title}</span>
            {description ? (
              <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                {description}
              </span>
            ) : null}
          </span>
          <span className="flex shrink-0 items-center gap-3">
            {trailing}
            <span className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1 font-mono text-[10px] tracking-[0.14em] text-muted uppercase transition-colors group-open:border-brand/30 group-open:bg-brand group-open:text-white">
              <Plus size={11} aria-hidden />
              Add
            </span>
          </span>
        </summary>
        <div className="border-t border-line px-5 py-5">{children}</div>
      </details>
    </Card>
  );
}
