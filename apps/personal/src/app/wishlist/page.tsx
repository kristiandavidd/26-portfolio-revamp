import Image from "next/image";
import type { Metadata } from "next";
import { Check, Sparkles } from "lucide-react";
import type { PersonalWishlistView } from "@repo/db";
import { Container } from "@repo/ui";
import { PageIntro } from "@/components/PageIntro";
import { getContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Wishlist",
  description:
    "Things still to do, and the ones already crossed off — the personal list of Kristian David.",
  alternates: { canonical: "/wishlist" },
};

function WishlistRow({ item }: { item: PersonalWishlistView }) {
  return (
    <li className="flex items-start gap-4 py-5">
      <span className="relative mt-0.5 h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-line bg-sand">
        {item.image ? (
          <Image
            src={item.image.url}
            alt=""
            fill
            unoptimized
            sizes="56px"
            className="object-cover"
          />
        ) : (
          <span className="flex h-full items-center justify-center bg-violet/[0.05] text-violet/50">
            <Sparkles size={16} aria-hidden />
          </span>
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={
            item.done
              ? "text-sm font-medium text-muted line-through"
              : "text-sm font-medium text-ink"
          }
        >
          {item.title}
        </p>
        {item.note ? (
          <p className="mt-1 text-xs leading-relaxed text-muted">{item.note}</p>
        ) : null}
      </div>

      <span
        aria-label={item.done ? "Done" : "Still to do"}
        className={
          item.done
            ? "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet text-white"
            : "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line text-transparent"
        }
      >
        <Check size={13} aria-hidden />
      </span>
    </li>
  );
}

export default async function WishlistPage() {
  const { wishlist } = await getContent();

  const done = wishlist.filter((item) => item.done);
  const pending = wishlist.filter((item) => !item.done);

  return (
    <main className="page-in flex-1 pb-28">
      <Container className="pt-10 sm:pt-14">
        <PageIntro
          eyebrow="Wishlist"
          title="Things worth wanting."
          description="Places to see, things to try, skills to learn — and the ones already crossed off."
        />

        {wishlist.length === 0 ? (
          <p className="mt-16 rounded-2xl border border-dashed border-line px-6 py-20 text-center text-sm text-muted">
            Nothing on the list yet. Give it a little time.
          </p>
        ) : null}

        {pending.length > 0 ? (
          <section className="mt-14">
            <h2 className="font-display text-3xl leading-none">Still to do</h2>
            <ul className="mt-5 divide-y divide-line border-y border-line">
              {pending.map((item) => (
                <WishlistRow key={item.id} item={item} />
              ))}
            </ul>
          </section>
        ) : null}

        {done.length > 0 ? (
          <section className="mt-14">
            <h2 className="font-display text-3xl leading-none">Already done</h2>
            <ul className="mt-5 divide-y divide-line border-y border-line">
              {done.map((item) => (
                <WishlistRow key={item.id} item={item} />
              ))}
            </ul>
          </section>
        ) : null}
      </Container>
    </main>
  );
}
