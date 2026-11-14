"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ImageUp, Music } from "lucide-react";
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
  accept,
  allowPaste = false,
}: {
  label: string;
  name: string;
  asset: AssetInfo | null;
  hint?: string;
  /** Override the file types, e.g. an audio accept list for music. */
  accept?: string;
  /** Accept an image straight from the clipboard (Ctrl/Cmd+V). */
  allowPaste?: boolean;
}) {
  const isAudio = (accept ?? "").startsWith("audio");
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    if (!localUrl) return;
    return () => URL.revokeObjectURL(localUrl);
  }, [localUrl]);

  const applyFile = useCallback((next: File) => {
    const named =
      next.name && next.name.trim()
        ? next
        : new File([next], `pasted-${Date.now()}.png`, { type: next.type });

    const transfer = new DataTransfer();
    transfer.items.add(named);
    if (inputRef.current) inputRef.current.files = transfer.files;

    setFile(named);
    setLocalUrl(URL.createObjectURL(named));
    setCleared(false);
  }, []);

  useEffect(() => {
    if (!allowPaste || isAudio) return;

    const onPaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      const imageItem = Array.from(items).find((item) =>
        item.type.startsWith("image/"),
      );
      const pasted = imageItem?.getAsFile();
      if (!pasted) return;

      event.preventDefault();
      applyFile(pasted);
    };

    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [allowPaste, isAudio, applyFile]);

  function pick(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] ?? null;
    if (!next) {
      setFile(null);
      setLocalUrl(null);
      return;
    }
    applyFile(next);
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
        accept={accept ?? ACCEPT}
        onChange={pick}
        className="sr-only"
      />

      {shownUrl ? (
        <div className="grid grid-cols-[auto_1fr] items-start gap-3 rounded-xl border border-line bg-surface p-2.5">
          <span className="relative row-span-2 flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-sand">
            {isAudio ? (
              <Music size={22} aria-hidden className="text-brand" />
            ) : localUrl ? (
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
                  : isAudio
                    ? "Audio"
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

          {allowPaste && !isAudio ? (
            <span className="col-span-2 block text-[11px] text-muted">
              Paste an image with Ctrl+V to replace it.
            </span>
          ) : null}
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-dashed border-line bg-surface px-4 py-4 text-left transition-colors hover:border-brand/40 hover:bg-brand/[0.03]"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
            {isAudio ? (
              <Music size={17} aria-hidden />
            ) : (
              <ImageUp size={17} aria-hidden />
            )}
          </span>
          <span>
            <span className="block text-sm font-medium text-ink">
              {isAudio ? "Upload an audio file" : "Upload an image"}
            </span>
            <span className="block text-xs text-muted">
              {isAudio
                ? "MP3, WAV or OGG. Uploaded to Silos."
                : "PNG, JPG, WebP, AVIF or SVG. Uploaded to Silos."}
              {allowPaste && !isAudio ? " You can also paste with Ctrl+V." : ""}
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
