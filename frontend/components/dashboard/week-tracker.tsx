"use client";

// "Orders this week" — a lollipop-per-day tracker (inspired by an income-tracker layout),
// in our warm-paper/ink palette. Orders/day over the last 7 days, a highlighted column with a
// value tooltip, and a big week-over-week delta on the left. All derived from the orders feed.
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { ChevronDown, Package } from "lucide-react";
import type { Order } from "@/lib/api";

type Day = { iso: string; letter: string; count: number };

function isoLocal(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function build(orders: Order[]): { days: Day[]; thisTotal: number; deltaPct: number; peak: number } {
  const dates = orders.map((o) => o.ordered_date).filter(Boolean);
  const anchorIso = dates.length ? dates.reduce((a, b) => (a > b ? a : b)) : isoLocal(new Date());
  const anchor = new Date(anchorIso + "T00:00:00");
  const countOn = (iso: string) => orders.filter((o) => o.ordered_date === iso).length;

  const days: Day[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(anchor);
    d.setDate(anchor.getDate() - i);
    const iso = isoLocal(d);
    days.push({ iso, letter: d.toLocaleDateString("en-US", { weekday: "narrow" }), count: countOn(iso) });
  }

  let prev = 0;
  for (let i = 13; i >= 7; i--) {
    const d = new Date(anchor);
    d.setDate(anchor.getDate() - i);
    prev += countOn(isoLocal(d));
  }

  const thisTotal = days.reduce((s, d) => s + d.count, 0);
  const deltaPct = prev > 0 ? Math.round(((thisTotal - prev) / prev) * 100) : thisTotal > 0 ? 100 : 0;
  const peak = days.reduce((best, d, i, arr) => (d.count > arr[best].count ? i : best), 0);
  return { days, thisTotal, deltaPct, peak };
}

const MAX_STEM = 118; // px

export function WeekTracker({ orders }: { orders: Order[] }) {
  const { days, thisTotal, deltaPct, peak } = useMemo(() => build(orders), [orders]);
  const [hovered, setHovered] = useState<number | null>(null);
  const selected = hovered ?? peak;

  const max = Math.max(1, ...days.map((d) => d.count));
  const stemPx = (count: number) => 6 + (count / max) * (MAX_STEM - 6);
  const up = deltaPct >= 0;

  return (
    <section className="rounded-2xl border border-line bg-surface p-6">
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-inset text-ink-2">
            <Package size={16} />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight text-ink">Orders this week</h2>
            <p className="text-xs text-ink-3">Orders placed over the last 7 days</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-2">
          Week <ChevronDown size={13} />
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* Delta */}
        <div className="shrink-0">
          <p
            className="font-display text-4xl font-semibold tracking-tight"
            style={{ color: up ? "var(--delivered)" : "var(--delayed)" }}
          >
            {up ? "+" : ""}
            {deltaPct}%
          </p>
          <p className="mt-1 max-w-[160px] text-sm leading-snug text-ink-3">
            {`This week’s ${thisTotal} orders are ${up ? "higher" : "lower"} than last week’s`}
          </p>
        </div>

        {/* Lollipop week */}
        <div className="relative flex-1">
          <div className="flex h-[200px] items-end justify-between gap-2" onMouseLeave={() => setHovered(null)}>
            {days.map((d, i) => {
              const isSel = i === selected;
              return (
                <button
                  key={d.iso}
                  onMouseEnter={() => setHovered(i)}
                  className="relative flex flex-1 flex-col items-center justify-end"
                  style={{ height: "100%" }}
                >
                  {/* highlight capsule */}
                  {isSel && (
                    <span className="absolute inset-x-1 bottom-0 top-2 rounded-full" style={{ background: "var(--inset)" }} />
                  )}

                  {/* tooltip on the selected day */}
                  {isSel && (
                    <motion.span
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-20 -translate-y-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-canvas shadow-md"
                      style={{ background: "var(--ink)", bottom: stemPx(d.count) + 46 }}
                    >
                      {d.count} {d.count === 1 ? "order" : "orders"}
                      <span
                        className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45"
                        style={{ background: "var(--ink)" }}
                      />
                    </motion.span>
                  )}

                  {/* dot */}
                  <span
                    className="relative z-10 mb-[-1px] rounded-full"
                    style={{
                      height: isSel ? 12 : 9,
                      width: isSel ? 12 : 9,
                      background: isSel ? "var(--brand)" : "color-mix(in srgb, var(--brand) 45%, var(--surface))",
                    }}
                  />

                  {/* stem */}
                  <motion.span
                    className="relative z-10 w-[2px] rounded-full"
                    style={{ background: isSel ? "var(--brand)" : "var(--line-strong)" }}
                    initial={{ height: 0 }}
                    animate={{ height: stemPx(d.count) }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.04 }}
                  />

                  {/* day chip */}
                  <span
                    className="relative z-10 mt-2 grid h-9 w-9 place-items-center rounded-full text-xs font-semibold"
                    style={
                      isSel
                        ? { background: "var(--ink)", color: "var(--canvas)" }
                        : { background: "var(--inset)", color: "var(--ink-3)" }
                    }
                  >
                    {d.letter}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
