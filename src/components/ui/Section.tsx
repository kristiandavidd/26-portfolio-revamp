import type { ReactNode } from "react";
import { Container } from "./Container";

type SectionProps = {
  id: string;
  children?: ReactNode;
  className?: string;
};

export function Section({ id, children, className = "" }: SectionProps) {
  return (
    <section
      id={id}
      className={`scroll-mt-24 py-20 sm:py-28 ${className}`.trim()}
    >
      <Container>{children}</Container>
    </section>
  );
}
