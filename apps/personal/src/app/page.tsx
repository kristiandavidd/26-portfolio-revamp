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
    href: "/places",
    label: "Places",
    icon: MapPin,
    blurb: "Where I have been.",
  },
  {
    href: "/gallery",
    label: "Gallery",
    icon: Images,
    blurb: "Frames without a story.",
  },
  {
    href: "/wishlist",
    label: "Wishlist",
    icon: ListChecks,
    blurb: "Still to do.",
  },
];

export default async function PersonalHome() {
  const { profile, places, gallery } = await getContent();

  const counts: Record<string, string> = {
    "/places": places.length > 0 ? `${places.length} places` : "",
    "/gallery": gallery.length > 0 ? `${gallery.length} photos` : "",
    "/wishlist": "",
  };

  return (
    <main className="page-in relative flex-1">
      {/* The photograph stays put; only the content scrolls over it. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        {profile.hero ? (
          <Image
            src={profile.hero.url}
            alt=""
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-paper/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-paper" />
      </div>

      <Container className="flex min-h-[100svh] flex-col pt-16 pb-36 sm:pt-24">
        <header className="max-w-2xl">
          <Reveal>
            {profile.portrait ? (
              <span className="relative block h-16 w-16 overflow-hidden rounded-full border border-white/25">
                <Image
                  src={profile.portrait.url}
                  alt={profile.name}
                  fill
                  priority
                  unoptimized
                  sizes="64px"
                  className="object-cover"
                />
              </span>
            ) : null}

            <h1 className="font-display mt-6 text-[clamp(2.25rem,7vw,5rem)] leading-[0.92] text-balance text-white">
              {profile.name || "Hello."}
            </h1>

            {profile.headline ? (
              <p className="mt-5 font-mono text-[11px] tracking-[0.24em] text-violet uppercase">
                {profile.headline}
              </p>
            ) : null}

            {profile.intro ? (
              <p className="mt-7 max-w-xl text-base leading-relaxed whitespace-pre-line text-white/75">
                {profile.intro}
              </p>
            ) : (
              <p className="mt-7 max-w-xl text-base leading-relaxed text-white/50">
                The introduction is still being written.
              </p>
            )}
          </Reveal>
        </header>

        <Reveal>
          <section className="mt-auto flex flex-col gap-3 pt-16">
            <Link
              href="/story"
              className="group flex items-center justify-between gap-6 rounded-2xl border border-white/15 bg-black/35 px-6 py-6 backdrop-blur-md transition-colors hover:border-violet/60 hover:bg-black/45"
            >
              <span className="flex min-w-0 items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet/15 text-violet">
                  <BookOpen size={18} aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="font-display block text-2xl leading-none text-white sm:text-3xl">
                    Read the story
                  </span>
                  <span className="mt-2 block truncate text-xs text-white/60">
                    The chapters that led here, in order.
                  </span>
                </span>
              </span>
              <ArrowUpRight
                size={18}
                aria-hidden
                className="shrink-0 text-white/35 transition-colors group-hover:text-violet"
              />
            </Link>

            <div className="grid gap-3 sm:grid-cols-3">
              {INDEX.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center gap-4 rounded-2xl border border-white/15 bg-black/35 px-5 py-5 backdrop-blur-md transition-colors hover:border-violet/60 hover:bg-black/45"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet/15 text-violet">
                      <Icon size={17} aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-white">
                        {item.label}
                      </span>
                      <span className="mt-1 block truncate font-mono text-[9px] tracking-[0.16em] text-white/45 uppercase">
                        {counts[item.href] || item.blurb}
                      </span>
                    </span>
                    <ArrowUpRight
                      size={15}
                      aria-hidden
                      className="shrink-0 text-white/30 transition-colors group-hover:text-violet"
                    />
                  </Link>
                );
              })}
            </div>
          </section>
        </Reveal>
      </Container>
    </main>
  );
}
