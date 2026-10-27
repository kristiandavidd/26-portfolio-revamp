import Image from "next/image";
import { Container, Reveal } from "@repo/ui";
import { PageIntro } from "@/components/PageIntro";
import { getContent } from "@/lib/content";

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
            <ol className="mt-16 flex flex-col gap-14 border-l border-line pl-6 sm:pl-10">
              {story.map((card) => (
                <li key={card.id} className="relative">
                  <span
                    aria-hidden
                    className="absolute top-2 -left-[29px] h-2.5 w-2.5 rounded-full bg-violet ring-4 ring-white sm:-left-[45px]"
                  />

                  <p className="font-mono text-[10px] tracking-[0.24em] text-violet uppercase">
                    {card.period || "Undated"}
                  </p>
                  <h2 className="font-display mt-3 text-3xl leading-tight text-balance sm:text-4xl">
                    {card.title}
                  </h2>

                  {card.image ? (
                    <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl bg-sand">
                      <Image
                        src={card.image.url}
                        alt={card.title}
                        fill
                        unoptimized
                        sizes="(min-width: 1024px) 60vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  ) : null}

                  {card.body ? (
                    <p className="mt-6 max-w-2xl text-sm leading-relaxed whitespace-pre-line text-black/70 sm:text-base">
                      {card.body}
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          </Reveal>
        )}
      </Container>
    </main>
  );
}
