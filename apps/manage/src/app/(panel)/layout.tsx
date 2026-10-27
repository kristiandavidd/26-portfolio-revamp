import type { ReactNode } from "react";
import { prisma } from "@repo/db";
import { requireSession } from "@/lib/auth";
import { readFlash } from "@/lib/flash";
import { Sidebar } from "@/components/panel/Sidebar";
import { FlashToast } from "@/components/panel/FlashToast";

export const dynamic = "force-dynamic";

export default async function PanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireSession();

  // The sidebar wears the same mark as the public site. A missing profile or a
  // database hiccup should never lock the panel out, so it falls back to the
  // monogram instead.
  const profile = await prisma.profile
    .findUnique({
      where: { id: 1 },
      select: { logoAsset: { select: { url: true } } },
    })
    .catch(() => null);

  const flash = await readFlash();

  return (
    <div className="min-h-screen bg-paper lg:flex">
      <Sidebar
        username={session.username}
        logoUrl={profile?.logoAsset?.url ?? null}
      />
      <main className="min-w-0 flex-1 px-4 py-7 sm:px-8 lg:px-12 lg:py-10">
        <div className="page-in mx-auto w-full max-w-6xl">{children}</div>
      </main>
      <FlashToast
        key={flash ? `${flash.tone}:${flash.message}` : "empty"}
        flash={flash}
      />
    </div>
  );
}
