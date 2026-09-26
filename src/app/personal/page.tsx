import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "The personal side",
  description: "A different personality, still being built.",
};

// Deliberately the same ids as the technical portfolio, so the section nav in
// the bottom bar works here untouched. The switch is meant to read as a change
// of surface, not a change of navigation, which only holds if the bar is
// pointing at the same six things on both sides.
const SECTIONS = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "certifications", label: "Certifications" },
  { id: "contact", label: "Contact" },
];

export default function PersonalPage() {
  return (
    // The palette is a scope, not a global switch: the attribute sits here, so
    // every token inside resolves to the warm set while the rest of the app
    // keeps its own. This page owns its personality outright.
    <div
      data-theme="personal"
      className="page-in flex flex-1 flex-col bg-white text-black"
    >
      <Container className="flex flex-1 flex-col pt-24 pb-28 sm:pt-32">
        <section id="hero" className="scroll-mt-24">
          <p className="font-mono text-[11px] tracking-[0.25em] text-muted uppercase">
            The personal side
          </p>

          <h1 className="font-display mt-5 max-w-4xl text-[clamp(2rem,7vw,4.5rem)] leading-[0.95] uppercase">
            A canvas, still empty
          </h1>

          <p className="mt-6 max-w-lg leading-relaxed text-muted">
            A different personality rather than a different colour: its own
            structure, its own voice, its own content. None of it is written yet,
            so the space below is being held open for it.
          </p>

          {/* Left blank on purpose. A placeholder would shape whatever lands
              here, so the canvas is just a canvas. */}
          <div className="mt-14 flex min-h-[34vh] items-center justify-center border border-dashed border-line">
            <p className="font-mono text-[11px] tracking-[0.25em] text-muted uppercase">
              Canvas
            </p>
          </div>
        </section>

        {/* The remaining five are staked out rather than filled, so the bar has
            somewhere to go and the shape of the page is already decided. */}
        {SECTIONS.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="mt-24 scroll-mt-24 border-t border-line pt-16"
          >
            <p className="font-mono text-[11px] tracking-[0.25em] text-muted uppercase">
              {section.label}
            </p>
            <p className="font-display mt-4 text-[clamp(1.5rem,4vw,2.75rem)] leading-[1] text-muted uppercase">
              Still being written
            </p>
          </section>
        ))}
      </Container>
    </div>
  );
}
