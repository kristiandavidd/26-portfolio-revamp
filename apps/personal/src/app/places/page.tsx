import Image from "next/image";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Container, Reveal } from "@repo/ui";
import { PageIntro } from "@/components/PageIntro";
import { getContent } from "@/lib/content";

export default async function PlacesPage() {
  const { places } = await getContent();

  return (
    <main className="page-in flex-1 pb-28">
      <Container className="pt-10 sm:pt-14">
        <PageIntro
          eyebrow="Places"
          title="Everywhere I have been."
          description="A running record of places worth the trip, with the year, one line about it, and a pin on the map."
          meta={
            places.length > 0 ? (
              <p className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
                {places.length} {places.length === 1 ? "place" : "places"}
              </p>
            ) : null
          }
        />

        {places.length === 0 ? (
          <p className="mt-16 rounded-2xl border border-dashed border-line px-6 py-20 text-center text-sm text-muted">
            Nowhere pinned yet. Every trip gets added when it happens.
          </p>
        ) : (
          <Reveal>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {places.map((place) => (
                <article
                  key={place.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition-colors hover:border-violet/60"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-sand">
                    {place.image ? (
                      <Image
                        src={place.image.url}
                        alt={place.name}
                        fill
                        unoptimized
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-violet/[0.05] text-violet/50">
                        <MapPin size={28} aria-hidden />
                      </div>
                    )}

                    {place.year ? (
                      <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 font-mono text-[9px] tracking-[0.16em] text-black uppercase backdrop-blur">
                        {place.year}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="font-display text-2xl leading-none">
                      {place.name}
                    </h2>
                    {place.region ? (
                      <p className="mt-2 font-mono text-[9px] tracking-[0.18em] text-muted uppercase">
                        {place.region}
                      </p>
                    ) : null}
                    {place.note ? (
                      <p className="mt-3 text-sm leading-relaxed text-black/70">
                        {place.note}
                      </p>
                    ) : null}

                    {place.mapsUrl ? (
                      <a
                        href={place.mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-auto inline-flex items-center gap-1.5 pt-5 text-xs text-violet transition-colors hover:text-violet-dark"
                      >
                        Open in Maps
                        <ArrowUpRight size={13} aria-hidden />
                      </a>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </Reveal>
        )}
      </Container>
    </main>
  );
}
