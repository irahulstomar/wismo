"use client";

// THE SIGNATURE — a package's route to the door. Every WISMO answer renders this instead of
// just printing "in transit". Filled segments draw in on mount; the current stop is lit and
// colored by outcome (evergreen = delivered, signal = delayed, ink-navy = en route).
import { motion } from "motion/react";
import { Check, TriangleAlert } from "lucide-react";
import { JOURNEY_STEPS, ORDER_STATUS } from "@/lib/status";
import type { OrderStatus } from "@/lib/api";

export function JourneyRail({
  status,
  dates,
  className = "",
}: {
  status: OrderStatus;
  dates?: (string | null)[];
  className?: string;
}) {
  const { step, delayed } = ORDER_STATUS[status];
  const currentAccent = delayed
    ? "var(--delayed)"
    : status === "delivered"
      ? "var(--delivered)"
      : "var(--brand)";

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-start">
        {JOURNEY_STEPS.map((label, i) => {
          const done = i < step;
          const current = i === step;
          const isFirst = i === 0;
          const isLast = i === JOURNEY_STEPS.length - 1;
          const leftFilled = !isFirst && i <= step;
          const rightFilled = !isLast && i < step;

          return (
            <div key={label} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <Connector filled={leftFilled} hidden={isFirst} order={i} />
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.07, duration: 0.28, ease: "easeOut" }}
                  className="relative z-10 grid shrink-0 place-items-center rounded-full"
                  style={{
                    width: current ? 18 : 13,
                    height: current ? 18 : 13,
                    background: done ? "var(--brand)" : current ? currentAccent : "var(--surface)",
                    border: !done && !current ? "1.5px solid var(--line-strong)" : "none",
                    boxShadow: current
                      ? `0 0 0 4px color-mix(in srgb, ${currentAccent} 16%, transparent)`
                      : "none",
                  }}
                >
                  {done && <Check size={9} color="var(--brand-fg)" strokeWidth={3.5} />}
                  {current && delayed && <TriangleAlert size={10} color="#fff" strokeWidth={2.5} />}
                  {current && !delayed && (
                    <span className="h-1 w-1 rounded-full bg-white" />
                  )}
                </motion.div>
                <Connector filled={rightFilled} hidden={isLast} order={i} />
              </div>
              <span
                className="mt-1.5 px-0.5 text-center text-[10px] leading-tight"
                style={{
                  color: current ? "var(--ink)" : "var(--ink-3)",
                  fontWeight: current ? 600 : 500,
                }}
              >
                {label}
              </span>
              {dates?.[i] && (
                <span className="mt-0.5 text-center text-[10px] leading-tight text-ink-muted">
                  {dates[i]}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Connector({
  filled,
  hidden,
  order,
}: {
  filled: boolean;
  hidden: boolean;
  order: number;
}) {
  if (hidden) return <div className="h-0.5 flex-1" />;
  if (!filled) {
    return <div className="h-0.5 flex-1 rounded-full" style={{ background: "var(--line)" }} />;
  }
  return (
    <motion.div
      className="h-0.5 flex-1 origin-left rounded-full"
      style={{ background: "var(--brand)" }}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ delay: 0.1 + order * 0.09, duration: 0.35, ease: "easeOut" }}
    />
  );
}
