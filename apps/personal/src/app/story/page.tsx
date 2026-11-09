import type { Metadata } from "next";
import { Container, Reveal } from "@repo/ui";
import { PageIntro } from "@/components/PageIntro";
import { getContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Story",
  description:
    "The long version of how Kristian David got here, told in chronological chapters.",
  alternates: { canonical: "/story" },
};

export default async function StoryPage() {
  const { story } = await getContent();

  return (
    <main className="page-in flex-1 pb-28">
      <Container className="pt-10 sm:pt-14">
        <PageIntro
          eyebrow="Story"
          title="How it got here."
          description="The long version, told in order. One chapter at a time, without the highlight reel."
          meta={
            story.length > 0 ? (
              <p className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
                {story.length} {story.length === 1 ? "chapter" : "chapters"}
              </p>
            ) : null
          }
        />

        {story.length === 0 ? (
          <p className="mt-16 rounded-2xl border border-dashed border-line px-6 py-20 text-center text-sm text-muted">
            No chapters yet. The first one is still being written.
          </p>
        ) : (
          <Reveal>
            <ol className="mt-16 flex flex-col gap-20 border-l border-line pl-6 sm:pl-10">
              {story.map((chapter) => (
                <li key={chapter.id} className="relative">
                  <span
                    aria-hidden
                    className="absolute top-2 -left-[29px] h-2.5 w-2.5 rounded-full bg-violet ring-4 ring-white sm:-left-[45px]"
                  />

                  <p className="font-mono text-[10px] tracking-[0.24em] text-violet uppercase">
                    {chapter.year || "Undated"}
                  </p>

                  {chapter.title ? (
                    <h2 className="font-display mt-3 text-4xl leading-tight text-balance sm:text-5xl">
                      {chapter.title}
                    </h2>
                  ) : null}

                  <div className="mt-10 flex max-w-2xl flex-col gap-10">
                    {chapter.subchapters.map((subchapter) => (
                      <section key={subchapter.id}>
                        <h3 className="font-display text-2xl leading-tight text-balance">
                          {subchapter.title}
                        </h3>

                        <div className="mt-4 flex flex-col gap-4">
                          {subchapter.paragraphs.map((paragraph) => (
                            <p
                              key={paragraph.id}
                              className="text-sm leading-relaxed whitespace-pre-line text-black/70 sm:text-base"
                            >
                              {paragraph.body}
                            </p>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        )}
      </Container>
    </main>
  );
}
