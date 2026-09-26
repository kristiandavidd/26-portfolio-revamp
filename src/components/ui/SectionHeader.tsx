type SectionHeaderProps = {
  title: string;
  description?: string;
  tone?: "light" | "dark";
};

export function SectionHeader({
  title,
  description,
  tone = "light",
}: SectionHeaderProps) {
  const isDark = tone === "dark";

  return (
    <header className="max-w-2xl">
      <h2
        className={`font-display text-3xl tracking-widest text-balance uppercase sm:text-4xl ${
          isDark ? "text-white" : ""
        }`.trim()}
      >
        {title}
      </h2>
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
