import type { ReactNode } from "react";

export function PageIntro({
  eyebrow,
  title,
  description,
  meta,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  meta?: ReactNode;
}) {
  return (
    <header className="max-w-3xl">
      <p className="font-mono text-[10px] tracking-[0.28em] text-violet uppercase">
        {eyebrow}
      </p>
      <h1 className="font-display mt-4 text-[clamp(2rem,6.5vw,4.5rem)] leading-[0.95] text-balance">
        {title}
      </h1>
      {description ? (
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          {description}
        </p>
      ) : null}
      {meta ? <div className="mt-6">{meta}</div> : null}
    </header>
  );
}
