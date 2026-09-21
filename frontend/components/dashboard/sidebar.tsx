"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Inbox as InboxIcon,
  Package,
  BarChart3,
  BookOpen,
  Settings,
  Store,
  ArrowUpRight,
  Sparkles,
  ChevronsUpDown,
  type LucideIcon,
} from "lucide-react";
import { getConversations } from "@/lib/api";
import { CompassMark } from "@/components/logo";

const NAV: { icon: LucideIcon; label: string; href: string }[] = [
  { icon: InboxIcon, label: "Inbox", href: "/dashboard" },
  { icon: Package, label: "Orders", href: "/dashboard/orders" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: BookOpen, label: "Knowledge", href: "/dashboard/knowledge" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [openCount, setOpenCount] = useState(0);

  // Live open-conversation count for the Inbox badge.
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const cs = await getConversations();
        if (active) setOpenCount(cs.filter((c) => c.status !== "resolved").length);
      } catch {
        /* ignore */
      }
    };
    load();
    const t = setInterval(load, 4000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, []);

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-line px-3 py-4 md:flex">
      <div className="flex items-center gap-2.5 px-2 py-1">
        <CompassMark size={26} />
        <div className="leading-tight">
          <p className="font-display text-sm font-semibold tracking-tight text-ink">Northbound</p>
          <p className="text-xs text-ink-3">Support</p>
        </div>
      </div>

      <nav className="mt-6 space-y-1">
        {NAV.map(({ icon: Icon, label, href }) => {
          const active = href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                active ? "bg-inset text-ink" : "text-ink-3 hover:bg-inset/60 hover:text-ink-2"
              }`}
            >
              <Icon size={17} />
              <span>{label}</span>
              {label === "Inbox" && openCount > 0 && (
                <span className="ml-auto rounded-full bg-inset px-2 text-[11px] font-semibold text-ink-3">
                  {openCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-1">
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ink-3 transition-colors hover:bg-inset hover:text-ink">
          <Sparkles size={17} />
          <span>What&rsquo;s new</span>
        </button>
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ink-3 transition-colors hover:bg-inset hover:text-ink"
        >
          <Store size={17} />
          <span>View storefront</span>
          <ArrowUpRight size={14} className="ml-auto" />
        </Link>
        <button className="mt-1 flex w-full items-center gap-2.5 rounded-xl border border-line px-3 py-2.5 text-left">
          <span
            className="grid h-8 w-8 place-items-center rounded-full text-sm font-semibold text-brand-fg"
            style={{ background: "var(--brand)" }}
          >
            AK
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">Alex Kim</p>
            <p className="truncate text-xs text-ink-3">Admin</p>
          </div>
          <ChevronsUpDown size={15} className="ml-auto text-ink-3" />
        </button>
      </div>
    </aside>
  );
}
