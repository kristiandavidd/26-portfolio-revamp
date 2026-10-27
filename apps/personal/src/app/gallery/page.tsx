import { Container } from "@repo/ui";
import { GalleryWall } from "@/components/GalleryWall";
import { PageIntro } from "@/components/PageIntro";
import { getContent } from "@/lib/content";

export default async function GalleryPage() {
  const { gallery } = await getContent();
  const photos = gallery.filter((item) => item.image);

  return (
    <main className="page-in flex-1 pb-28">
      <Container className="pt-10 sm:pt-14">
        <PageIntro
          eyebrow="Gallery"
          title="Photographs, mostly."
          description="No itinerary, no order that matters. Tap a frame to see it full size, then use the arrows."
          meta={
            photos.length > 0 ? (
              <p className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
                {photos.length} {photos.length === 1 ? "photo" : "photos"}
              </p>
            ) : null
          }
        />

        {photos.length === 0 ? (
          <p className="mt-16 rounded-2xl border border-dashed border-line px-6 py-20 text-center text-sm text-muted">
            This wall is still waiting for its first photo.
          </p>
        ) : (
          <GalleryWall items={photos} />
        )}
      </Container>
    </main>
  );
}
