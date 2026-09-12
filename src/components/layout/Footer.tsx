import { Container } from "@/components/ui/Container";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <Container className="flex flex-col items-center justify-between gap-3 py-10 text-sm text-muted sm:flex-row">
        <p>© {new Date().getFullYear()}. All rights reserved.</p>
        {/* Social links */}
      </Container>
    </footer>
  );
}
