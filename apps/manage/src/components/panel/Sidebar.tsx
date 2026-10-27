"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Award,
  BookOpen,
  Briefcase,
  Building2,
  FolderKanban,
  Images,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Package,
  Sparkles,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@repo/ui";
import { logout } from "@/lib/actions/auth";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

const GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Content",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/profile", label: "Profile", icon: User },
      { href: "/experience", label: "Experience", icon: Briefcase },
      { href: "/companies", label: "Companies", icon: Building2 },
      { href: "/projects", label: "Projects", icon: FolderKanban },
      { href: "/products", label: "Dephilia products", icon: Package },
      { href: "/credentials", label: "Credentials", icon: Award },
    ],
  },
  {
    label: "Personal",
    items: [
      { href: "/personal", label: "Landing", icon: Sparkles, exact: true },
      { href: "/personal/story", label: "Story", icon: BookOpen },
      { href: "/personal/places", label: "Places", icon: MapPin },
      { href: "/personal/gallery", label: "Gallery", icon: Images },
      { href: "/personal/wishlist", label: "Wishlist", icon: ListChecks },
    ],
  },
  {
    label: "Activity",
    items: [{ href: "/messages", label: "Messages", icon: Mail }],
  },
];

function Brand({ logoUrl }: { logoUrl: string | null }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand">
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
      <span className="min-w-0">
        <span className="block font-mono text-[9px] tracking-[0.24em] text-white/40 uppercase">
          Kristian David
        </span>
        <span className="font-display block truncate text-[15px] tracking-wide text-white uppercase">
          Content panel
        </span>
      </span>
    </div>
  );
}

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-7 overflow-y-auto px-3 py-6">
      {GROUPS.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-2 font-mono text-[10px] tracking-[0.22em] text-white/40 uppercase">
            {group.label}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = item.exact
                ? pathname === item.href
                : item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "bg-white/[0.08] text-white"
                        : "text-white/55 hover:bg-white/[0.04] hover:text-white",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full transition-opacity",
                        active ? "bg-brand opacity-100" : "opacity-0",
                      )}
                    />
                    <Icon
                      size={16}
                      aria-hidden
                      className={active ? "text-brand" : "text-white/40 group-hover:text-white/70"}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Footer({ username }: { username: string }) {
  const portfolioUrl =
    process.env.NEXT_PUBLIC_PORTFOLIO_URL || "https://kristiandav.id";

  return (
    <div className="border-t border-white/10 px-5 py-4">
      <p className="truncate font-mono text-[10px] tracking-[0.16em] text-white/35 uppercase">
        {username}
      </p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <a
          href={portfolioUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-white/50 transition-colors hover:text-brand"
        >
          View portfolio
        </a>
        <form action={logout}>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 text-xs text-white/45 transition-colors hover:text-white"
          >
            <LogOut size={13} aria-hidden />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

export function Sidebar({
  username,
  logoUrl,
}: {
  username: string;
  logoUrl: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop rail */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-ink lg:flex">
        <div className="px-5 py-6">
          <Brand logoUrl={logoUrl} />
        </div>
        <Navigation />
        <Footer username={username} />
      </aside>

      {/* Mobile bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between gap-4 bg-ink px-4 py-3 lg:hidden">
        <Brand logoUrl={logoUrl} />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80"
        >
          <Menu size={18} aria-hidden />
        </button>
      </div>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
          />
          <div className="page-in relative flex h-full w-[17.5rem] flex-col bg-ink shadow-2xl">
            <div className="flex items-center justify-between gap-3 px-4 py-4">
              <Brand logoUrl={logoUrl} />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70"
              >
                <X size={16} aria-hidden />
              </button>
            </div>
            <Navigation onNavigate={() => setOpen(false)} />
            <Footer username={username} />
          </div>
        </div>
      ) : null}
    </>
  );
}
