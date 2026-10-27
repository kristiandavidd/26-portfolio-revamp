import type { ReactNode } from "react";
import { cn } from "./cn";

type Tone = "info" | "success" | "error";

const TONES: Record<Tone, string> = {
  info: "border-sky-200 bg-sky-50 text-sky-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-red-200 bg-red-50 text-red-900",
};

export function Alert({
  tone = "info",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-4 py-3 text-sm leading-relaxed",
        TONES[tone],
        className,
      )}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface/60 px-6 py-14 text-center">
      <p className="text-sm font-medium text-ink">{title}</p>
      {description ? (
        <p className="max-w-sm text-sm leading-relaxed text-muted">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
