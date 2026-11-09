import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Images,
  ListChecks,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import { Container, Reveal } from "@repo/ui";
import { getContent } from "@/lib/content";

type IndexCard = {
  href: string;
  label: string;
  icon: LucideIcon;
  blurb: string;
};

const INDEX: IndexCard[] = [
  {
    href: "/story",
    label: "Story",
    icon: BookOpen,
    blurb: "The chapters that led here, in order.",
  },
  {
    href: "/places",
    label: "Places",
    icon: MapPin,
    blurb: "Where I have been, one frame at a time.",
  },
  {
    href: "/gallery",
    label: "Gallery",
    icon: Images,
    blurb: "Photographs that did not need a story.",
  },
  {
    href: "/wishlist",
    label: "Wishlist",
    icon: ListChecks,
    blurb: "Still to do, and already ticked off.",
  },
];

export default async function PersonalHome() {
  const { profile, story, places, gallery, wishlist } = await getContent();
  const portfolioUrl =
    process.env.NEXT_PUBLIC_PORTFOLIO_URL || "https://kristiandav.id";

  const counts: Record<string, string> = {
    "/story": story.length > 0 ? `${story.length} chapters` : "—",
    "/places": places.length > 0 ? `${places.length} places` : "—",
    "/gallery": gallery.length > 0 ? `${gallery.length} photos` : "—",
    "/wishlist":
      wishlist.length > 0
        ? `${wishlist.filter((item) => item.done).length}/${wishlist.length} done`
        : "—",
  };

  const recent = places.filter((place) => place.image).slice(0, 3);

  return (
    <main className="page-in flex-1 pb-28">
      <Container className="pt-10 sm:pt-14">
        <header className="flex items-center justify-between gap-6">
          <p className="font-mono text-[10px] tracking-[0.28em] text-muted uppercase">
            The personal side
          </p>
          <a
            href={portfolioUrl}
            className="font-mono text-[10px] tracking-[0.2em] text-black/55 uppercase transition-colors hover:text-violet"
          >
            The work &rarr;
          </a>
        </header>

        <section className="relative isolate mt-16 grid items-end gap-12 sm:mt-20 lg:grid-cols-[1.15fr_0.85fr]">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 right-0 -z-10 h-[28rem] w-[28rem] opacity-60"
            style={{
              backgroundImage:
                "radial-gradient(circle, color-mix(in srgb, var(--color-violet) 34%, transparent), transparent 68%)",
            }}
          />

          <Reveal>
            <h1 className="font-display text-[clamp(2.75rem,7.5vw,6rem)] leading-[0.92] text-balance">
              {profile.name || "Hello."}
            </h1>

            {profile.headline ? (
              <p className="mt-5 font-mono text-[11px] tracking-[0.24em] text-violet uppercase">
                {profile.headline}
              </p>
            ) : null}

            {profile.intro ? (
              <p className="mt-8 max-w-xl text-base leading-relaxed whitespace-pre-line text-black/70">
                {profile.intro}
              </p>
            ) : (
              <p className="mt-8 max-w-xl text-base leading-relaxed text-muted">
                The introduction is still being written.
              </p>
            )}

            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
              {profile.location ? (
                <div>
                  <dt className="font-mono text-[9px] tracking-[0.2em] text-muted uppercase">
                    Based in
                  </dt>
                  <dd className="mt-1 text-sm text-black/80">
                    {profile.location}
                  </dd>
                </div>
              ) : null}
              {profile.email ? (
                <div>
                  <dt className="font-mono text-[9px] tracking-[0.2em] text-muted uppercase">
                    Reach me
                  </dt>
                  <dd className="mt-1 text-sm">
                    <a
                      href={`mailto:${profile.email}`}
                      className="text-black/80 underline decoration-line underline-offset-4 transition-colors hover:text-violet"
                    >
                      {profile.email}
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
          </Reveal>

          <div className="relative">
            <div
              aria-hidden
              className="absolute -top-16 right-4 h-64 w-64 rounded-full opacity-70"
              style={{
                backgroundImage:
                  "radial-gradient(circle, color-mix(in srgb, var(--color-violet) 55%, transparent), transparent 70%)",
              }}
            />
            {profile.portrait ? (
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-sand">
                <Image
                  src={profile.portrait.url}
                  alt={profile.name}
                  fill
                  priority
                  unoptimized
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="relative flex aspect-[4/5] items-center justify-center rounded-2xl border border-dashed border-line bg-white">
                <p className="font-mono text-[10px] tracking-[0.26em] text-muted uppercase">
                  Portrait
                </p>
              </div>
            )}
          </div>
        </section>

        <Reveal>
          <section className="mt-20 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {INDEX.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex flex-col gap-6 rounded-2xl border border-line bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-violet/60"
                >
                  <span className="flex items-start justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet/10 text-violet">
                      <Icon size={17} aria-hidden />
                    </span>
                    <ArrowUpRight
                      size={16}
                      aria-hidden
                      className="text-black/25 transition-colors group-hover:text-violet"
                    />
                  </span>
                  <span>
                    <span className="font-display block text-2xl leading-none">
                      {item.label}
                    </span>
                    <span className="mt-2 block text-xs leading-relaxed text-muted">
                      {item.blurb}
                    </span>
                  </span>
                  <span className="mt-auto font-mono text-[9px] tracking-[0.18em] text-violet uppercase">
                    {counts[item.href]}
                  </span>
                </Link>
              );
            })}
          </section>
        </Reveal>

        {recent.length > 0 ? (
          <Reveal>
            <section className="mt-20">
              <div className="flex items-end justify-between gap-6">
                <h2 className="font-display text-4xl leading-none">
                  Recently, elsewhere
                </h2>
                <Link
                  href="/places"
                  className="font-mono text-[10px] tracking-[0.18em] text-muted uppercase transition-colors hover:text-violet"
                >
                  All places &rarr;
                </Link>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {recent.map((place) => (
                  <Link
                    key={place.id}
                    href="/places"
                    className="group overflow-hidden rounded-2xl border border-line bg-white transition-colors hover:border-violet/60"
                  >
                    <span className="relative block aspect-[4/3] overflow-hidden bg-sand">
                      <Image
                        src={place.image!.url}
                        alt={place.name}
                        fill
                        unoptimized
                        sizes="(min-width: 640px) 33vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </span>
                    <span className="block px-4 py-3">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="truncate text-sm font-medium">
                          {place.name}
                        </span>
                        <span className="shrink-0 font-mono text-[9px] tracking-[0.16em] text-violet uppercase">
                          {place.year}
                        </span>
                      </span>
                      <span className="mt-1 block truncate text-xs text-muted">
                        {place.note || place.region}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </Reveal>
        ) : null}
      </Container>
    </main>
  );
}
