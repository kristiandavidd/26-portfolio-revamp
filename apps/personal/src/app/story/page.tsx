import type { Metadata } from "next";
import { Container } from "@repo/ui";
import { PageIntro } from "@/components/PageIntro";
import { StoryChapters } from "@/components/StoryChapters";
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
        />

        {story.length === 0 ? (
          <p className="mt-16 rounded-2xl border border-dashed border-line px-6 py-20 text-center text-sm text-muted">
            No chapters yet. The first one is still being written.
          </p>
        ) : (
          <StoryChapters chapters={story} />
        )}
      </Container>
    </main>
  );
}
