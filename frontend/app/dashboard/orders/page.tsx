"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X } from "lucide-react";
import { listOrders, type Order, type OrderStatus } from "@/lib/api";
import { ORDER_STATUS, formatDate } from "@/lib/status";
import { Pill } from "@/components/pill";
import { OrderCard } from "@/components/order-card";
import { OrderDetails } from "@/components/dashboard/order-details";

const STATUS_ORDER: OrderStatus[] = ["not_yet_shipped", "shipped", "in_transit", "delivered", "delayed"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [selected, setSelected] = useState<Order | null>(null);

  useEffect(() => {
    listOrders().then(setOrders).catch(() => setOrders([]));
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    for (const s of STATUS_ORDER) c[s] = orders.filter((o) => o.status === s).length;
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (!q) return true;
      return (
        o.order_no.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_email.toLowerCase().includes(q)
      );
    });
  }, [orders, query, statusFilter]);

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-line px-6 pb-3 pt-5">
        <div className="flex items-baseline gap-3">
          <h1 className="font-display text-xl font-semibold tracking-tight text-ink">Orders</h1>
          <span className="text-sm text-ink-3">{orders.length} total</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <FilterTab active={statusFilter === "all"} onClick={() => setStatusFilter("all")} label="All" count={counts.all} />
          {STATUS_ORDER.map((s) => (
            <FilterTab
              key={s}
              active={statusFilter === s}
              onClick={() => setStatusFilter(s)}
              label={ORDER_STATUS[s].label}
              count={counts[s] ?? 0}
            />
          ))}
          <div className="ml-auto flex items-center gap-2 rounded-lg border border-line bg-inset px-3 py-1.5">
            <Search size={14} className="text-ink-3" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search order # or customer…"
              className="w-52 bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
            />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-medium uppercase tracking-wide text-ink-3">
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">Items</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Carrier</th>
                <th className="hidden px-4 py-3 font-medium xl:table-cell">Destination</th>
                <th className="px-4 py-3 text-right font-medium">ETA / Delivered</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const meta = ORDER_STATUS[o.status];
                const itemSummary =
                  o.items.length === 0
                    ? "—"
                    : o.items[0].name + (o.items.length > 1 ? ` +${o.items.length - 1}` : "");
                const date = o.status === "delivered" ? o.delivered_date : o.eta_date;
                return (
                  <tr
                    key={o.order_no}
                    onClick={() => setSelected(o)}
                    className="cursor-pointer border-b border-line-soft transition-colors last:border-0 hover:bg-canvas"
                  >
                    <td className="px-4 py-3 font-mono text-ink-2">{o.order_no}</td>
                    <td className="px-4 py-3 font-medium text-ink">{o.customer_name}</td>
                    <td className="hidden max-w-[220px] truncate px-4 py-3 text-ink-2 lg:table-cell">{itemSummary}</td>
                    <td className="px-4 py-3">
                      <Pill label={meta.label} fg={meta.fg} bg={meta.bg} />
                    </td>
                    <td className="hidden px-4 py-3 text-ink-2 md:table-cell">{o.carrier ?? "—"}</td>
                    <td className="hidden px-4 py-3 text-ink-2 xl:table-cell">
                      {o.ship_city}, {o.ship_state}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-ink-2">{date ? formatDate(date) : "—"}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-ink-3">
                    No orders match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrderDrawer order={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function FilterTab({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? "bg-ink text-canvas" : "border border-line text-ink-2 hover:border-line-strong"
      }`}
    >
      {label} <span className={active ? "opacity-70" : "text-ink-3"}>{count}</span>
    </button>
  );
}

function OrderDrawer({ order, onClose }: { order: Order | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {order && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-[100dvh] w-[380px] max-w-[90vw] flex-col border-l border-line bg-raised shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
          >
            <header className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-display text-sm font-semibold tracking-tight text-ink">Order details</h2>
              <button
                onClick={onClose}
                className="grid h-8 w-8 place-items-center rounded-full text-ink-3 transition-colors hover:bg-inset hover:text-ink"
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </header>
            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              <OrderCard order={order} />
              <OrderDetails order={order} />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
