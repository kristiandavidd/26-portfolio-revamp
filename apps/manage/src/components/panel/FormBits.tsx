"use client";

import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@repo/ui";
import { Dialog } from "@/components/panel/Dialog";
import { SubmitButton } from "@/components/panel/SubmitButton";

export function DeleteForm({
  action,
  id,
  path,
  label = "Delete",
  confirm = "It disappears from the site right away. The record stays in the database and can be recovered.",
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  path: string;
  label?: string;
  confirm?: string;
}) {
  const [open, setOpen] = useState(false);

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

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        label="Confirm deletion"
        className="max-w-md"
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
          This is a soft delete: the entry is archived and hidden from the
          public site, but nothing is erased and its files stay attached.
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
            <SubmitButton variant="danger" size="sm" pendingLabel="Deleting…">
              Delete
            </SubmitButton>
          </form>
        </div>
      </Dialog>
    </>
  );
}
