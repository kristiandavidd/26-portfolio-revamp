import type { ReactNode } from "react";

type SectionHeaderProps = {
  title: string;
  description?: string;
  tone?: "light" | "dark";
  /** Sections that put their content down a centre column use this too. */
  align?: "left" | "center";
  /** "wide" matches the column width of a section whose content runs wider than the default measure. */
  width?: "default" | "wide";
  /** Rendered between the title and the description. */
  children?: ReactNode;
};

export function SectionHeader({
  title,
  description,
  tone = "light",
  align = "left",
  width = "default",
  children,
}: SectionHeaderProps) {
  const isDark = tone === "dark";
  const isCentered = align === "center";
  const measure = width === "wide" ? "max-w-3xl" : "max-w-2xl";

  return (
    <header
      className={`${measure} ${isCentered ? "mx-auto text-center" : ""}`.trim()}
    >
      <h2
        className={`font-display text-3xl tracking-widest text-balance uppercase sm:text-4xl ${
          isDark ? "text-white" : ""
        }`.trim()}
      >
        {title}
      </h2>
      {children}
      {description ? (
        <p
          className={`mt-4 leading-relaxed ${
            isDark ? "text-white/70" : "text-muted"
          }`}
        >
          {description}
        </p>
      ) : null}
    </header>
  );
}
