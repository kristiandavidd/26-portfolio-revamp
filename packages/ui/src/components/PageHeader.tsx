import type { ReactNode } from "react";
import { cn } from "./cn";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div>
        {eyebrow ? (
          <p className="font-mono text-[10px] tracking-[0.24em] text-brand uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display mt-2 text-[2rem] leading-[1.05] tracking-wide text-ink uppercase sm:text-[2.6rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
    </header>
  );
}
