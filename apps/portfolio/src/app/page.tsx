import { Footer } from "@/components/layout/Footer";
import { About } from "@/components/sections/About";
import { Certifications } from "@/components/sections/Certifications";
import { Community } from "@/components/sections/Community";
import { Dephilia } from "@/components/sections/Dephilia";
import { Experience } from "@/components/sections/Experience";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { getContent } from "@/lib/content";

export default async function Home() {
  const content = await getContent();

  return (
    <>
      <main className="page-in flex-1">
        <Hero profile={content.profile} />
        <About profile={content.profile} />
        <Experience items={content.experience} />
        <Projects projects={content.projects} />
        <Dephilia
          dephilia={content.dephilia}
          products={content.dephiliaProducts}
        />
        <Certifications items={content.certifications} />
        <Community items={content.community} />
      </main>
      <Footer profile={content.profile} />
    </>
  );
}
