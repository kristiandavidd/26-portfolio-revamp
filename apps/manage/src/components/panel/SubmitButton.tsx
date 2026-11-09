"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@repo/ui";

/**
 * Every form in the panel submits through this button: it shows a spinner while
 * the action is in flight and locks itself so the same entry cannot be saved
 * twice.
 */
export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  size = "md",
  className,
}: {
  children: ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      disabled={pending}
      aria-busy={pending}
      className={className}
    >
      {pending ? (
        <Loader2 size={14} className="animate-spin" aria-hidden />
      ) : null}
      {pending ? (pendingLabel ?? children) : children}
    </Button>
  );
}
