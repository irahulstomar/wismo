"use client";

import { useMemo, useState } from "react";
import { Search, Truck, Clock, MapPin, AlertTriangle, PackageX, Pencil, Compass, CalendarClock, type LucideIcon } from "lucide-react";

type Article = { title: string; excerpt: string; tag: string; Icon: LucideIcon };

const ARTICLES: Article[] = [
  { title: "How order tracking works", excerpt: "Follow your package from label to doorstep, and what each status means.", tag: "Tracking", Icon: Truck },
  { title: "Understanding delivery estimates", excerpt: "How we calculate your ETA and why it can shift by a day.", tag: "Delivery", Icon: Clock },
  { title: "What does “In transit” mean?", excerpt: "Your package is moving through the carrier network toward you.", tag: "Statuses", Icon: MapPin },
  { title: "My package is delayed — what now?", excerpt: "Steps to take when a shipment misses its estimated arrival.", tag: "Delays", Icon: AlertTriangle },
  { title: "Report a lost or missing package", excerpt: "Marked delivered but nothing arrived? Here's how we help.", tag: "Issues", Icon: PackageX },
  { title: "Change your shipping address", excerpt: "When an address can still be updated before a package ships.", tag: "Orders", Icon: Pencil },
  { title: "Carrier guide: USPS, UPS & FedEx", excerpt: "Who carries your order and how their tracking differs.", tag: "Carriers", Icon: Compass },
  { title: "When will my order ship?", excerpt: "Processing times and cutoffs for same-day handoff.", tag: "Shipping", Icon: CalendarClock },
];

export default function KnowledgePage() {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return ARTICLES;
    return ARTICLES.filter((a) => (a.title + a.excerpt + a.tag).toLowerCase().includes(s));
  }, [q]);

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-line px-6 pb-4 pt-5">
        <h1 className="font-display text-xl font-semibold tracking-tight text-ink">Knowledge</h1>
        <p className="mt-0.5 text-sm text-ink-3">Help articles the assistant draws on</p>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-2 rounded-xl border border-line bg-inset px-3.5 py-2.5 focus-within:border-line-strong">
            <Search size={16} className="text-ink-3" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search help articles…"
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
            />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {results.map(({ title, excerpt, tag, Icon }) => (
              <article
                key={title}
                className="group cursor-pointer rounded-2xl border border-line bg-surface p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-inset text-ink-2">
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">{tag}</p>
                    <h2 className="mt-0.5 text-sm font-semibold text-ink">{title}</h2>
                    <p className="mt-1 text-xs leading-relaxed text-ink-3">{excerpt}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {results.length === 0 && (
            <p className="py-16 text-center text-sm text-ink-3">No articles match “{q}”.</p>
          )}
        </div>
      </div>
    </div>
  );
}
