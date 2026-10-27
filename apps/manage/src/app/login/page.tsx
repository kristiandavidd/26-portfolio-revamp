import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { prisma } from "@repo/db";
import { LoginForm } from "@/components/auth/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const profile = await prisma.profile
    .findUnique({
      where: { id: 1 },
      select: { logoAsset: { select: { url: true } }, name: true },
    })
    .catch(() => null);

  const logoUrl = profile?.logoAsset?.url ?? null;
  const portfolioUrl =
    process.env.NEXT_PUBLIC_PORTFOLIO_URL || "https://kristiandav.id";

  return (
    <main className="min-h-screen lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand side: the same black, orange and halftone the public site uses. */}
      <section className="relative hidden overflow-hidden bg-ink p-12 lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden className="halftone absolute inset-0 opacity-40" />
        <div
          aria-hidden
          className="absolute -right-24 -bottom-32 h-[28rem] w-[28rem] rounded-full"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--color-brand) 55%, transparent), transparent 68%)",
          }}
        />

        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-brand">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt=""
                width={44}
                height={44}
                unoptimized
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="font-display text-sm text-white">KD</span>
            )}
          </span>
          <span>
            <span className="block font-mono text-[9px] tracking-[0.26em] text-white/40 uppercase">
              Kristian David
            </span>
            <span className="font-display block text-base tracking-wide text-white uppercase">
              Content panel
            </span>
          </span>
        </div>

        <div className="relative max-w-xl">
          <p className="font-mono text-[10px] tracking-[0.28em] text-brand uppercase">
            One source of truth
          </p>
          <h1 className="font-display mt-6 text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.95] text-balance text-white uppercase">
            Content, without the guesswork.
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-white/55">
            Projects, experience, credentials and the artwork behind them — all
            in one place, all attached to the same records the portfolio reads.
          </p>

          <ul className="mt-10 flex flex-wrap gap-2">
            {["Projects", "Assets in Silos", "Messages", "Settings"].map(
              (item) => (
                <li
                  key={item}
                  className="rounded-full border border-white/15 px-3 py-1 font-mono text-[10px] tracking-[0.14em] text-white/60 uppercase"
                >
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>

        <a
          href={portfolioUrl}
          target="_blank"
          rel="noreferrer"
          className="relative inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-white/40 uppercase transition-colors hover:text-white"
        >
          Open the public site
          <ArrowUpRight size={13} aria-hidden />
        </a>
      </section>

      {/* Form side */}
      <section className="flex min-h-screen items-center justify-center bg-paper px-5 py-16 lg:min-h-0">
        <div className="page-in w-full max-w-sm">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-brand">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt=""
                  width={40}
                  height={40}
                  unoptimized
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="font-display text-sm text-white">KD</span>
              )}
            </span>
            <span className="font-display text-sm tracking-wide text-ink uppercase">
              Content panel
            </span>
          </div>

          <p className="font-mono text-[10px] tracking-[0.24em] text-brand uppercase">
            Sign in
          </p>
          <h2 className="font-display mt-3 text-3xl tracking-wide text-ink uppercase">
            Welcome back
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Use the panel credentials from the environment file.
          </p>

          <div className="mt-8">
            <LoginForm />
          </div>

          <Link
            href={portfolioUrl}
            className="mt-8 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] text-muted uppercase transition-colors hover:text-ink"
          >
            Back to the portfolio
            <ArrowUpRight size={12} aria-hidden />
          </Link>
        </div>
      </section>
    </main>
  );
}
