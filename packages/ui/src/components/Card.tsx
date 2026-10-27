import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(10,10,10,0.03)]",
        className,
      )}
      {...props}
    />
  );
}

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "accent";

const TONES: Record<BadgeTone, string> = {
  neutral: "border-line bg-sand text-ink/60",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-red-200 bg-red-50 text-red-700",
  accent: "border-brand/25 bg-brand/10 text-brand",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-[0.08em] uppercase",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
