// Order-context panel (mockup style): status + est. delivery, shipping details, and a Customer
// section. The journey rail lives in the thread's OrderCard, so it's not repeated here.
// Totals + customer history are deterministic fabricated demo values.
import { ArrowRight, User } from "lucide-react";
import type { Order } from "@/lib/api";
import { ORDER_STATUS, formatDate, formatMonthDay } from "@/lib/status";
import { Pill } from "@/components/pill";

function hashNum(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}
const usd = (n: number) => `$${n.toLocaleString("en-US")}.00`;

export function OrderDetails({ order }: { order: Order }) {
  const meta = ORDER_STATUS[order.status];
  const itemCount = order.items.reduce((s, i) => s + i.qty, 0);
  const itemTotal = (hashNum(order.order_no) % 380) + 60; // $60–439
  const custOrders = (hashNum(order.customer_name) % 7) + 2; // 2–8
  const custTotal = itemTotal + (hashNum(order.customer_name) % 500) + 120;
  const delivered = order.status === "delivered";

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold tracking-tight text-ink">
            Order {order.order_no}
          </h2>
          <span className="text-xs text-ink-3">
            {delivered ? `Delivered ${formatMonthDay(order.delivered_date)}` : `Est. delivery ${formatMonthDay(order.eta_date) || "—"}`}
          </span>
        </div>
        <div className="mt-2">
          <Pill label={meta.label} fg={meta.fg} bg={meta.bg} />
        </div>
      </div>

      <Rows
        rows={[
          ["Tracking number", order.tracking_number ?? "—", true],
          ["Carrier", order.carrier ?? "—", false],
          ["Shipped", order.carrier ? formatDate(order.ordered_date) : "—", false],
          ["Items", `${itemCount} item${itemCount === 1 ? "" : "s"} · ${usd(itemTotal)}`, false],
        ]}
      />

      <div className="border-t border-line-soft pt-5">
        <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-3">
          <User size={13} /> Customer
        </p>
        <div className="flex items-center gap-3">
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold text-brand-fg"
            style={{ background: "var(--brand)" }}
          >
            {order.customer_name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{order.customer_name}</p>
            <p className="truncate text-xs text-ink-3">{order.customer_email}</p>
          </div>
        </div>
        <div className="mt-4">
          <Rows
            rows={[
              ["Orders", `${custOrders} orders · ${usd(custTotal)} total`, false],
              ["Location", `${order.ship_city}, ${order.ship_state}, USA`, false],
            ]}
          />
        </div>
      </div>

      <button className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-line bg-surface py-2.5 text-sm font-medium text-ink transition-colors hover:border-line-strong">
        View order <ArrowRight size={15} />
      </button>
    </div>
  );
}

function Rows({ rows }: { rows: [string, string, boolean][] }) {
  return (
    <div className="space-y-3">
      {rows.map(([k, v, mono]) => (
        <div key={k} className="flex items-start justify-between gap-3 text-sm">
          <span className="shrink-0 text-ink-3">{k}</span>
          <span className={`text-right font-medium text-ink ${mono ? "font-mono text-[13px]" : ""}`}>{v}</span>
        </div>
      ))}
    </div>
  );
}
