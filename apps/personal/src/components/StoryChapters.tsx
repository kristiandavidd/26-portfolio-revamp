"use client";

import { useState, useSyncExternalStore } from "react";
import { ChevronDown } from "lucide-react";
import type { PersonalChapterView } from "@repo/db";

const STORAGE_KEY = "personal:story:chapter";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function readStored() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function readServer() {
  return null;
}

/**
 * Chapters open one at a time. The first is open by default; after that the
 * last opened chapter is remembered, so coming back lands where you left off.
 */
export function StoryChapters({ chapters }: { chapters: PersonalChapterView[] }) {
  const stored = useSyncExternalStore(subscribe, readStored, readServer);
  const [picked, setPicked] = useState<string | null | undefined>(undefined);

  const openId =
    picked !== undefined ? picked : (stored ?? chapters[0]?.id ?? null);

  function toggle(id: string) {
    if (openId === id) {
      setPicked(null);
      return;
    }

    setPicked(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // Private mode or a blocked store: the accordion still works this visit.
    }
  }

  return (
    <ol className="mt-16 border-l border-line pl-6 sm:pl-10">
      {chapters.map((chapter) => {
        const open = openId === chapter.id;

        return (
          <li key={chapter.id} className="relative py-4">
            <span
              aria-hidden
              className="absolute top-[1.75rem] -left-[29px] h-2.5 w-2.5 rounded-full bg-violet ring-4 ring-paper sm:-left-[45px]"
            />

            <button
              type="button"
              onClick={() => toggle(chapter.id)}
              aria-expanded={open}
              aria-controls={`chapter-${chapter.id}`}
              className="group flex w-full items-start justify-between gap-6 text-left"
            >
              <span className="min-w-0">
                <span className="block font-mono text-[10px] tracking-[0.24em] text-violet uppercase">
                  {chapter.year || "Undated"}
                </span>
                {chapter.title ? (
                  <span className="font-display mt-3 block text-3xl leading-tight text-balance transition-colors group-hover:text-violet sm:text-4xl">
                    {chapter.title}
                  </span>
                ) : null}
              </span>

              <ChevronDown
                size={18}
                aria-hidden
                className={`mt-1 shrink-0 text-ink/40 transition-transform duration-300 group-hover:text-violet ${open ? "rotate-180" : ""
                  }`}
              />
            </button>

            {open ? (
              <div
                id={`chapter-${chapter.id}`}
                className="mt-8 flex max-w-2xl flex-col gap-10"
              >
                {chapter.subchapters.map((subchapter) => (
                  <section key={subchapter.id}>
                    <h3 className="font-display text-2xl leading-tight text-balance">
                      {subchapter.title}
                    </h3>

                    <div className="mt-4 flex flex-col gap-4">
                      {subchapter.paragraphs.map((paragraph) => (
                        <p
                          key={paragraph.id}
                          className="text-sm leading-relaxed whitespace-pre-line text-ink/70 sm:text-base"
                        >
                          {paragraph.body}
                        </p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
