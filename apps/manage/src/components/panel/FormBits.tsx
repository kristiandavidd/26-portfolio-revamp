"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@repo/ui";

export function DeleteForm({
  action,
  id,
  path,
  label = "Delete",
  confirm = "The record is removed immediately. This cannot be undone.",
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  path: string;
  label?: string;
  confirm?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <Button
        type="button"
        variant="danger"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Trash2 size={13} aria-hidden />
        {label}
      </Button>

      {open ? (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Cancel"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
          />

          <div
            role="alertdialog"
            aria-modal="true"
            aria-label="Confirm deletion"
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
          >
            <div className="flex gap-4 px-6 pt-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertTriangle size={19} aria-hidden />
              </span>
              <div>
                <h2 className="text-base font-semibold text-ink">
                  Delete this item?
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {confirm}
                </p>
              </div>
            </div>

            <div className="mx-6 mt-5 rounded-xl border border-red-100 bg-red-50/60 px-4 py-3 text-xs leading-relaxed text-red-700">
              Anything linked to it will be removed or detached, depending on
              the relation.
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-line bg-paper/50 px-6 py-4">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <form action={action}>
                <input type="hidden" name="id" value={id} />
                <input type="hidden" name="_path" value={path} />
                <Button type="submit" variant="danger" size="sm">
                  Delete permanently
                </Button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
