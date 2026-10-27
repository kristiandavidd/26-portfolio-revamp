"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { ImageUp } from "lucide-react";
import { Button, Field } from "@repo/ui";

export type AssetInfo = {
  id: string;
  url: string;
  originalName: string;
  width: number | null;
  height: number | null;
};

const ACCEPT =
  "image/png,image/jpeg,image/webp,image/avif,image/svg+xml,image/gif";

export function AssetField({
  label,
  name,
  asset,
  hint,
}: {
  label: string;
  name: string;
  asset: AssetInfo | null;
  hint?: string;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    if (!localUrl) return;
    return () => URL.revokeObjectURL(localUrl);
  }, [localUrl]);

  function pick(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] ?? null;
    setFile(next);
    setLocalUrl(next ? URL.createObjectURL(next) : null);
    if (next) setCleared(false);
  }

  function remove() {
    setFile(null);
    setLocalUrl(null);
    setCleared(true);
    if (inputRef.current) inputRef.current.value = "";
  }

  const shownUrl = localUrl ?? (cleared ? null : (asset?.url ?? null));
  const title = file?.name ?? (cleared ? null : asset?.originalName);

  return (
    <Field label={label} hint={hint}>
      <input
        type="hidden"
        name={name}
        value={cleared || file ? "" : (asset?.id ?? "")}
      />
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        name={`${name}File`}
        accept={ACCEPT}
        onChange={pick}
        className="sr-only"
      />

      {shownUrl ? (
        <div className="grid grid-cols-[auto_1fr] items-start gap-3 rounded-xl border border-line bg-surface p-2.5">
          <span className="relative row-span-2 h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-sand">
            {localUrl ? (
              <span
                aria-hidden
                className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${localUrl})` }}
              />
            ) : (
              <Image
                src={shownUrl}
                alt=""
                fill
                unoptimized
                sizes="64px"
                className="object-contain p-1"
              />
            )}
          </span>

          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-ink">
              {title}
            </span>
            <span className="mt-0.5 block truncate font-mono text-[10px] tracking-[0.08em] text-muted uppercase">
              {file
                ? formatSize(file.size)
                : asset?.width && asset.height
                  ? `${asset.width}×${asset.height}`
                  : "Image"}
            </span>
            {file ? (
              <span className="mt-1 block text-[11px] text-brand">
                New upload · replaced when you save
              </span>
            ) : null}
          </span>

          <span className="col-start-2 flex items-center gap-1.5">
            <label
              htmlFor={inputId}
              className="inline-flex h-8 cursor-pointer items-center justify-center rounded-full border border-line bg-surface px-3 text-xs font-medium text-ink transition-colors hover:border-brand/40 hover:bg-sand"
            >
              Replace
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={remove}
              className="hover:text-red-600"
            >
              Remove
            </Button>
          </span>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-dashed border-line bg-surface px-4 py-4 text-left transition-colors hover:border-brand/40 hover:bg-brand/[0.03]"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
            <ImageUp size={17} aria-hidden />
          </span>
          <span>
            <span className="block text-sm font-medium text-ink">
              Upload an image
            </span>
            <span className="block text-xs text-muted">
              PNG, JPG, WebP, AVIF or SVG. Uploaded to Silos.
            </span>
          </span>
        </label>
      )}
    </Field>
  );
}

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
