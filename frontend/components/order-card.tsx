// Compact order card = order # + status tag + dated journey rail + carrier/tracking + est. delivery.
// Shared by the chat widget answer, the inbox thread body, and the storefront hero.
import { ExternalLink } from "lucide-react";
import type { Order } from "@/lib/api";
import { ORDER_STATUS, stepDatesFromOrder, formatMonthDay } from "@/lib/status";
import { Pill } from "./pill";
import { JourneyRail } from "./journey-rail";

export function OrderCard({
  order,
  subtitle,
  className = "",
}: {
  order: Order;
  subtitle?: string;
  className?: string;
}) {
  const meta = ORDER_STATUS[order.status];
  const delivered = order.status === "delivered";
  return (
    <div className={`overflow-hidden rounded-xl border border-line bg-raised ${className}`}>
      <div className="flex items-start justify-between px-3.5 pt-3">
        <div>
          <span className="font-mono text-sm font-semibold text-ink">{order.order_no}</span>
          {subtitle && <p className="text-xs text-ink-2">{subtitle}</p>}
        </div>
        <Pill label={meta.label} fg={meta.fg} bg={meta.bg} />
      </div>

      <div className="px-3.5 pb-3 pt-4">
        <JourneyRail status={order.status} dates={stepDatesFromOrder(order)} />
      </div>

      <div className="flex items-start justify-between gap-3 border-t border-line-soft px-3.5 py-2.5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">{order.carrier ?? "Preparing"}</p>
          {order.tracking_number ? (
            <p className="truncate font-mono text-xs text-ink-3">{order.tracking_number}</p>
          ) : (
            <p className="text-xs text-ink-3">Not shipped yet</p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-ink-3">{delivered ? "Delivered" : "Est. delivery"}</p>
          <p className="text-sm font-medium text-ink">
            {formatMonthDay(delivered ? order.delivered_date : order.eta_date) || "—"}
          </p>
        </div>
      </div>

      {order.tracking_url && (
        <a
          href={order.tracking_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 border-t border-line-soft px-3.5 py-2 text-xs font-medium text-brand transition-colors hover:text-brand-hover"
        >
          Track package <ExternalLink size={12} />
        </a>
      )}
    </div>
  );
}
