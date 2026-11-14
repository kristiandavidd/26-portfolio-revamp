"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import {
  Activity,
  Award,
  BookOpen,
  Briefcase,
  Building2,
  ChevronDown,
  FolderKanban,
  Images,
  LayoutDashboard,
  ListChecks,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Package,
  Settings,
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

type NavGroup = {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
};

const DASHBOARD: NavItem = {
  href: "/",
  label: "Dashboard",
  icon: LayoutDashboard,
  exact: true,
};

const GROUPS: NavGroup[] = [
  {
    label: "Professional",
    icon: Briefcase,
    items: [
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
    icon: Sparkles,
    items: [
      { href: "/personal", label: "Landing", icon: Sparkles, exact: true },
      { href: "/personal/story", label: "Story", icon: BookOpen },
      { href: "/personal/places", label: "Places", icon: MapPin },
      { href: "/personal/gallery", label: "Gallery", icon: Images },
      { href: "/personal/wishlist", label: "Wishlist", icon: ListChecks },
    ],
  },
  {
    label: "General",
    icon: Activity,
    items: [
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/messages", label: "Messages", icon: Mail },
    ],
  },
];

function isActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function groupFor(pathname: string) {
  return GROUPS.find((group) =>
    group.items.some((item) => isActive(pathname, item)),
  )?.label;
}

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
  // The group that owns the current route is open by default. A click stores
  // an exception for this route only, so navigating elsewhere re-derives the
  // default without a state-syncing effect.
  const [override, setOverride] = useState<{
    path: string;
    label: string | null;
  } | null>(null);

  const activeGroup = groupFor(pathname) ?? null;
  const expanded =
    override && override.path === pathname ? override.label : activeGroup;

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto px-3 py-5">
      <Link
        href={DASHBOARD.href}
        onClick={onNavigate}
        aria-current={pathname === DASHBOARD.href ? "page" : undefined}
        className={cn(
          "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
          pathname === DASHBOARD.href
            ? "bg-white/[0.08] text-white"
            : "text-white/55 hover:bg-white/[0.04] hover:text-white",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full transition-opacity",
            pathname === DASHBOARD.href ? "bg-brand opacity-100" : "opacity-0",
          )}
        />
        <DASHBOARD.icon
          size={16}
          aria-hidden
          className={
            pathname === DASHBOARD.href
              ? "text-brand"
              : "text-white/40"
          }
        />
        {DASHBOARD.label}
      </Link>

      <div className="mt-4 flex flex-col gap-1">
        {GROUPS.map((group) => {
          const open = expanded === group.label;
          const containsActive = group.items.some((item) =>
            isActive(pathname, item),
          );

          return (
            <div key={group.label}>
              <button
                type="button"
                onClick={() =>
                  setOverride({
                    path: pathname,
                    label: open ? null : group.label,
                  })
                }
                aria-expanded={open}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                  containsActive
                    ? "text-white"
                    : "text-white/55 hover:bg-white/[0.04] hover:text-white",
                )}
              >
                <group.icon
                  size={16}
                  aria-hidden
                  className={containsActive ? "text-brand" : "text-white/40"}
                />
                <span className="flex-1">{group.label}</span>
                <ChevronDown
                  size={14}
                  aria-hidden
                  className={cn(
                    "text-white/35 transition-transform",
                    open && "rotate-180",
                  )}
                />
              </button>

              {open ? (
                <ul className="mt-1 ml-5 flex flex-col gap-0.5 border-l border-white/10 pl-3">
                  {group.items.map((item) => {
                    const active = isActive(pathname, item);
                    const Icon = item.icon;

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onNavigate}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors",
                            active
                              ? "bg-white/[0.08] text-white"
                              : "text-white/50 hover:bg-white/[0.04] hover:text-white",
                          )}
                        >
                          <Icon
                            size={14}
                            aria-hidden
                            className={
                              active ? "text-brand" : "text-white/30"
                            }
                          />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

function SignOutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="inline-flex items-center gap-1.5 text-xs text-white/45 transition-colors hover:text-white disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? (
        <Loader2 size={13} className="animate-spin" aria-hidden />
      ) : (
        <LogOut size={13} aria-hidden />
      )}
      {pending ? "Signing out…" : "Sign out"}
    </button>
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
          <SignOutButton />
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
  const [drawer, setDrawer] = useState(false);

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
          onClick={() => setDrawer(true)}
          aria-label="Open menu"
          aria-expanded={drawer}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80"
        >
          <Menu size={18} aria-hidden />
        </button>
      </div>

      {/* Mobile drawer */}
      {drawer ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawer(false)}
            className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
          />
          <div className="page-in relative flex h-full w-[17.5rem] flex-col bg-ink shadow-2xl">
            <div className="flex items-center justify-between gap-3 px-4 py-4">
              <Brand logoUrl={logoUrl} />
              <button
                type="button"
                onClick={() => setDrawer(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70"
              >
                <X size={16} aria-hidden />
              </button>
            </div>
            <Navigation onNavigate={() => setDrawer(false)} />
            <Footer username={username} />
          </div>
        </div>
      ) : null}
    </>
  );
}
