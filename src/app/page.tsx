import { Footer } from "@/components/layout/Footer";
import { About } from "@/components/sections/About";
import { Certifications } from "@/components/sections/Certifications";
import { Community } from "@/components/sections/Community";
import { Dephilia } from "@/components/sections/Dephilia";
import { Experience } from "@/components/sections/Experience";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";

export default function Home() {
  return (
    <>
      <main className="page-in flex-1">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Dephilia />
        <Certifications />
        <Community />
      </main>
      <Footer />
    </>
  );
}
