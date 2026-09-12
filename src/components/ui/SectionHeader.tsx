type SectionHeaderProps = {
  index: string;
  title: string;
  description?: string;
  tone?: "light" | "dark";
};

export function SectionHeader({
  index,
  title,
  description,
  tone = "light",
}: SectionHeaderProps) {
  const isDark = tone === "dark";

  return (
    <header className="max-w-2xl">
      <span className="font-mono text-xs tracking-[0.2em] text-orange">
        {index}
      </span>
      <h2
        className={`mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl ${
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
