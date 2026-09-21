"use client";

import { useEffect, useState } from "react";
import { Calendar, ChevronDown, ArrowUp, ArrowDown } from "lucide-react";
import { listOrders, type Order } from "@/lib/api";
import { WeekTracker } from "@/components/dashboard/week-tracker";
import { Sparkline } from "@/components/sparkline";
import { Donut, type DonutSegment } from "@/components/donut";

// Demo-impressive figures (fabricated for the portfolio piece; the inbox uses real threads).
type Stat = { label: string; value: string; delta: string; good: boolean; spark: number[] };
const STATS: Stat[] = [
  { label: "Conversations", value: "487", delta: "+18%", good: true, spark: [12, 18, 15, 22, 20, 28, 26, 34] },
  { label: "Resolved", value: "412", delta: "+22%", good: true, spark: [10, 14, 13, 19, 22, 24, 28, 33] },
  { label: "Bot handled", value: "64%", delta: "+12%", good: true, spark: [40, 44, 48, 52, 55, 58, 61, 64] },
  { label: "First response", value: "1m 23s", delta: "−18%", good: true, spark: [30, 28, 27, 24, 22, 21, 19, 18] },
];

const CHANNELS: DonutSegment[] = [
  { label: "Website", value: 62, color: "var(--brand)" },
  { label: "Email", value: 18, color: "var(--ship)" },
  { label: "Instagram", value: 12, color: "var(--delivered)" },
  { label: "WhatsApp", value: 8, color: "var(--ink-3)" },
];

const INTENTS = [
  { label: "Where is my order?", pct: 38 },
  { label: "Shipping time", pct: 22 },
  { label: "Returns & refunds", pct: 18 },
  { label: "Order changes", pct: 12 },
  { label: "Product questions", pct: 10 },
];

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    listOrders().then(setOrders).catch(() => {});
  }, []);

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-line px-6 pb-4 pt-5">
        <h1 className="font-display text-xl font-semibold tracking-tight text-ink">Analytics</h1>
        <span className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-2">
          <Calendar size={13} /> Jul 1 – Jul 7 <ChevronDown size={13} />
        </span>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((s) => (
            <StatCard key={s.label} stat={s} />
          ))}
        </div>

        {/* Orders-this-week tracker (real data) */}
        <WeekTracker orders={orders} />

        {/* Channel mix + top intents */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Conversations by channel">
            <div className="flex items-center gap-6">
              <Donut segments={CHANNELS} />
              <div className="space-y-2">
                {CHANNELS.map((c) => (
                  <div key={c.label} className="flex items-center gap-2 text-sm">
                    <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: c.color }} />
                    <span className="text-ink-2">{c.label}</span>
                    <span className="ml-auto font-mono text-xs text-ink-3">{c.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card title="Top intents">
            <div className="space-y-3.5">
              {INTENTS.map((it) => (
                <div key={it.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-2">{it.label}</span>
                    <span className="font-mono text-xs text-ink-3">{it.pct}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-inset">
                    <div className="h-full rounded-full" style={{ width: `${it.pct * 2}%`, background: "var(--brand)" }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ stat }: { stat: Stat }) {
  const up = stat.delta.trim().startsWith("+");
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="text-xs font-medium text-ink-3">{stat.label}</p>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="font-display text-3xl font-semibold tracking-tight text-ink">{stat.value}</span>
        <span
          className="inline-flex items-center gap-0.5 text-xs font-semibold"
          style={{ color: stat.good ? "var(--delivered)" : "var(--delayed)" }}
        >
          {up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
          {stat.delta.replace(/^[+−-]/, "")}
        </span>
      </div>
      <div className="mt-3">
        <Sparkline data={stat.spark} color="var(--brand)" />
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <h2 className="mb-4 text-sm font-semibold text-ink">{title}</h2>
      {children}
    </div>
  );
}
