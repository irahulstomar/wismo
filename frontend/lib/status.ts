// Central mapping for the shipping-label system: order status -> label, journey position,
// and status colors (as CSS-var strings, applied via inline style so they're never purged).
import type { OrderStatus, ConversationStatus, Channel, Order } from "./api";

// The full route every package travels — the rail always shows all five stops.
export const JOURNEY_STEPS = [
  "Ordered",
  "Shipped",
  "In transit",
  "Out for delivery",
  "Delivered",
] as const;

export interface OrderStatusMeta {
  label: string;
  step: number; // index into JOURNEY_STEPS = the package's current stop
  delayed: boolean;
  fg: string;
  bg: string;
}

export const ORDER_STATUS: Record<OrderStatus, OrderStatusMeta> = {
  not_yet_shipped: { label: "Preparing", step: 0, delayed: false, fg: "var(--waiting)", bg: "var(--waiting-bg)" },
  shipped: { label: "Shipped", step: 1, delayed: false, fg: "var(--ship)", bg: "var(--ship-bg)" },
  in_transit: { label: "In transit", step: 2, delayed: false, fg: "var(--transit)", bg: "var(--transit-bg)" },
  delivered: { label: "Delivered", step: 4, delayed: false, fg: "var(--delivered)", bg: "var(--delivered-bg)" },
  delayed: { label: "Delayed", step: 2, delayed: true, fg: "var(--delayed)", bg: "var(--delayed-bg)" },
};

export const CONVERSATION_STATUS: Record<
  ConversationStatus,
  { label: string; fg: string; bg: string }
> = {
  needs_human: { label: "Needs you", fg: "var(--needs)", bg: "var(--needs-bg)" },
  bot_handled: { label: "Bot handled", fg: "var(--handled)", bg: "var(--handled-bg)" },
  resolved: { label: "Resolved", fg: "var(--resolved)", bg: "var(--resolved-bg)" },
};

export const CHANNEL_LABEL: Record<Channel, string> = {
  website: "Website",
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  email: "Email",
};

// "2026-07-10" -> "Jul 10, 2026". Returns "" for null so callers can branch.
export function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// "2026-07-10" -> "Jul 10" (compact, for rails and est-delivery).
export function formatMonthDay(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Per-step dates under the journey rail — filled only up to the package's current stop.
// [Ordered, Shipped, In transit, Out for delivery, Delivered]
export function stepDatesFromOrder(order: Order): (string | null)[] {
  const step = ORDER_STATUS[order.status].step;
  const base = new Date(order.ordered_date + "T00:00:00");
  const shift = (n: number) => {
    const d = new Date(base);
    d.setDate(base.getDate() + n);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };
  const delivered = order.delivered_date ?? order.eta_date;
  const raw = [shift(0), shift(1), shift(2), shift(3), delivered ? formatMonthDay(delivered) : null];
  return raw.map((d, i) => (i <= step ? d : null));
}

// Relative-ish timestamp for the inbox ("3h", "2d", "Jul 5").
export function shortTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
