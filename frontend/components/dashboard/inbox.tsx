"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Search,
  ListFilter,
  ChevronDown,
  UserPlus,
  Tag,
  CheckCheck,
  MoreHorizontal,
  Paperclip,
  Smile,
  Package,
} from "lucide-react";
import {
  getConversations,
  getConversation,
  getOrder,
  type ConversationSummary,
  type Conversation,
  type Order,
  type Channel,
} from "@/lib/api";
import { CONVERSATION_STATUS, CHANNEL_LABEL, shortTime } from "@/lib/status";
import { Pill } from "@/components/pill";
import { OrderCard } from "@/components/order-card";
import { OrderDetails } from "@/components/dashboard/order-details";

const POLL_MS = 4000;
const CHANNELS: (Channel | "all")[] = ["all", "website", "instagram", "whatsapp", "email"];

const clock = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

/* ------------------------------- avatars ------------------------------- */

const AVATAR_TINTS = [
  { bg: "#d9e6f1", fg: "#275a8a" },
  { bg: "#f3e4cb", fg: "#8a5a12" },
  { bg: "#d9e9dc", fg: "#2f6140" },
  { bg: "#f4ddd0", fg: "#9a3b1c" },
  { bg: "#e7e0d3", fg: "#6b6357" },
];

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "?";
}
function tintFor(name: string) {
  let h = 0;
  for (const ch of name) h = (h + ch.charCodeAt(0)) % AVATAR_TINTS.length;
  return AVATAR_TINTS[h];
}
function Avatar({ name, size = 38 }: { name: string; size?: number }) {
  const t = tintFor(name);
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full text-xs font-semibold"
      style={{ width: size, height: size, background: t.bg, color: t.fg }}
    >
      {initials(name)}
    </span>
  );
}

/* --------------------------------- shell -------------------------------- */

export function DashboardInbox() {
  const [list, setList] = useState<ConversationSummary[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<Conversation | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [channel, setChannel] = useState<Channel | "all">("all");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const cs = await getConversations();
        if (active) setList(cs);
      } catch {
        /* keep last known */
      }
    };
    load();
    const t = setInterval(load, POLL_MS);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, []);

  useEffect(() => {
    if (selectedId === null && list.length) setSelectedId(list[0].id);
  }, [list, selectedId]);

  useEffect(() => {
    if (selectedId === null) {
      setDetail(null);
      setOrder(null);
      return;
    }
    let active = true;
    const load = async () => {
      try {
        const d = await getConversation(selectedId);
        if (!active) return;
        setDetail(d);
        if (d.order_no) {
          try {
            const o = await getOrder(d.order_no);
            if (active) setOrder(o);
          } catch {
            if (active) setOrder(null);
          }
        } else {
          setOrder(null);
        }
      } catch {
        /* ignore */
      }
    };
    load();
    const t = setInterval(load, POLL_MS);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, [selectedId]);

  const shown = useMemo(
    () => (channel === "all" ? list : list.filter((c) => c.channel === channel)),
    [list, channel],
  );
  const openCount = list.filter((c) => c.status !== "resolved").length;

  return (
    <div className="flex h-full min-w-0 flex-1">
      <ConversationList
        items={shown}
        selectedId={selectedId}
        onSelect={setSelectedId}
        channel={channel}
        setChannel={setChannel}
        openCount={openCount}
      />
      <Thread detail={detail} order={order} />
      <OrderPanel order={order} hasConversation={detail !== null} />
    </div>
  );
}

/* --------------------------- conversation list --------------------------- */

function ConversationList({
  items,
  selectedId,
  onSelect,
  channel,
  setChannel,
  openCount,
}: {
  items: ConversationSummary[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  channel: Channel | "all";
  setChannel: (c: Channel | "all") => void;
  openCount: number;
}) {
  const [menu, setMenu] = useState(false);
  const label = channel === "all" ? "All channels" : CHANNEL_LABEL[channel];

  return (
    <section className="flex w-[360px] shrink-0 flex-col border-r border-line">
      <header className="border-b border-line px-4 pb-3 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h1 className="font-display text-lg font-semibold tracking-tight text-ink">Inbox</h1>
            <span className="text-xs text-ink-3">{openCount} open</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <button
                onClick={() => setMenu((m) => !m)}
                className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-medium text-ink-2 transition-colors hover:border-line-strong"
              >
                {label}
                <ChevronDown size={13} />
              </button>
              {menu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
                  <div className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-xl border border-line bg-raised py-1 shadow-lg">
                    {CHANNELS.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setChannel(c);
                          setMenu(false);
                        }}
                        className={`block w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-inset ${
                          channel === c ? "font-semibold text-ink" : "text-ink-2"
                        }`}
                      >
                        {c === "all" ? "All channels" : CHANNEL_LABEL[c]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button className="grid h-8 w-8 place-items-center rounded-lg border border-line text-ink-3 transition-colors hover:text-ink" aria-label="Filter">
              <ListFilter size={15} />
            </button>
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-ink-3">No conversations here.</p>
        ) : (
          items.map((c) => (
            <ConversationRow key={c.id} c={c} selected={c.id === selectedId} onClick={() => onSelect(c.id)} />
          ))
        )}
      </div>
    </section>
  );
}

function ConversationRow({
  c,
  selected,
  onClick,
}: {
  c: ConversationSummary;
  selected: boolean;
  onClick: () => void;
}) {
  const name = c.customer_name ?? "New visitor";
  const status = CONVERSATION_STATUS[c.status];
  const unread = c.status !== "resolved";
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start gap-3 border-b border-line-soft px-4 py-3 text-left transition-colors ${
        selected ? "bg-surface" : "hover:bg-surface/60"
      }`}
    >
      <Avatar name={name} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold text-ink">{name}</span>
          <span className="shrink-0 text-[11px] text-ink-3">{shortTime(c.updated_at)}</span>
        </div>
        <p className="mt-0.5 line-clamp-1 text-xs text-ink-3">{c.last_message}</p>
        <div className="mt-2 flex items-center gap-2">
          <Pill label={status.label} fg={status.fg} bg={status.bg} />
          {c.order_no && <span className="font-mono text-[11px] text-ink-3">{c.order_no}</span>}
        </div>
      </div>
      {unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: "var(--brand)" }} />}
    </button>
  );
}

/* --------------------------------- thread -------------------------------- */

function Thread({ detail, order }: { detail: Conversation | null; order: Order | null }) {
  const [reply, setReply] = useState("");
  const [tab, setTab] = useState<"reply" | "note">("reply");
  const [agentMsgs, setAgentMsgs] = useState<{ content: string; ts: string }[]>([]);

  useEffect(() => {
    setAgentMsgs([]);
  }, [detail?.id]);

  if (!detail) {
    return (
      <section className="flex flex-1 items-center justify-center text-sm text-ink-3">
        Select a conversation
      </section>
    );
  }

  const name = detail.customer_name ?? "New visitor";

  function sendReply() {
    const t = reply.trim();
    if (!t) return;
    setAgentMsgs((a) => [...a, { content: t, ts: new Date().toISOString() }]);
    setReply("");
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <header className="flex items-center gap-3 border-b border-line px-5 py-3">
        <Avatar name={name} size={34} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{name}</p>
          <p className="text-xs text-ink-3">via {CHANNEL_LABEL[detail.channel]}</p>
        </div>
        {[UserPlus, Tag, CheckCheck, MoreHorizontal].map((Icon, i) => (
          <button
            key={i}
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-3 transition-colors hover:bg-inset hover:text-ink"
          >
            <Icon size={16} />
          </button>
        ))}
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {detail.messages.map((m, i) => (
          <ThreadMessage key={i} role={m.role} content={m.content} ts={m.ts} name={name} />
        ))}
        {order && (
          <div className="flex justify-end">
            <div className="w-full max-w-[75%]">
              <OrderCard order={order} />
            </div>
          </div>
        )}
        {agentMsgs.map((m, i) => (
          <ThreadMessage key={`a${i}`} role="agent" content={m.content} ts={m.ts} name={name} />
        ))}
      </div>

      {/* Composer */}
      <div className="border-t border-line px-4 pt-2">
        <div className="flex gap-4 px-1">
          {(["reply", "note"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`border-b-2 pb-2 text-sm font-medium transition-colors ${
                tab === t ? "border-ink text-ink" : "border-transparent text-ink-3 hover:text-ink-2"
              }`}
            >
              {t === "reply" ? "Reply" : "Internal note"}
            </button>
          ))}
        </div>
        <div className="py-3">
          <input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendReply()}
            placeholder={tab === "reply" ? "Type your reply…" : "Add an internal note…"}
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
          />
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button className="grid h-8 w-8 place-items-center rounded-lg text-ink-3 hover:bg-inset hover:text-ink" aria-label="Attach">
                <Paperclip size={16} />
              </button>
              <button className="grid h-8 w-8 place-items-center rounded-lg text-ink-3 hover:bg-inset hover:text-ink" aria-label="Emoji">
                <Smile size={16} />
              </button>
            </div>
            <div className="flex overflow-hidden rounded-lg">
              <button
                onClick={sendReply}
                disabled={!reply.trim()}
                className="px-4 py-1.5 text-sm font-semibold text-brand-fg transition-opacity disabled:opacity-40"
                style={{ background: "var(--brand)" }}
              >
                Send
              </button>
              <button
                className="grid w-7 place-items-center border-l border-white/20 text-brand-fg"
                style={{ background: "var(--brand)" }}
                aria-label="Send options"
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ThreadMessage({
  role,
  content,
  ts,
  name,
}: {
  role: "user" | "assistant" | "agent";
  content: string;
  ts: string;
  name: string;
}) {
  const isCustomer = role === "user";
  if (isCustomer) {
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-2">
        <Avatar name={name} size={28} />
        <div className="max-w-[75%]">
          <div className="rounded-2xl bg-surface px-3.5 py-2.5 text-sm leading-relaxed text-ink" style={{ borderBottomLeftRadius: 6 }}>
            {content}
          </div>
          <span className="mt-1 px-1 text-[11px] text-ink-muted">{clock(ts)}</span>
        </div>
      </motion.div>
    );
  }
  const isBot = role === "assistant";
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-end">
      <span className="mb-1 px-1 text-[11px] font-medium text-ink-3">{isBot ? "Assistant" : "You"}</span>
      <div
        className="max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
        style={
          isBot
            ? { background: "color-mix(in srgb, var(--brand) 8%, var(--surface))", color: "var(--ink)", borderBottomRightRadius: 6 }
            : { background: "var(--brand)", color: "var(--brand-fg)", borderBottomRightRadius: 6 }
        }
      >
        {content}
      </div>
      <span className="mt-1 px-1 text-[11px] text-ink-muted">{clock(ts)}</span>
    </motion.div>
  );
}

/* ------------------------------- order panel ----------------------------- */

function OrderPanel({ order, hasConversation }: { order: Order | null; hasConversation: boolean }) {
  return (
    <aside className="hidden w-[340px] shrink-0 flex-col border-l border-line lg:flex">
      <div className="flex-1 overflow-y-auto p-5">
        {!hasConversation ? null : !order ? (
          <div className="mt-10 flex flex-col items-center text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-inset text-ink-3">
              <Package size={22} />
            </span>
            <p className="mt-3 text-sm font-medium text-ink-2">No order linked</p>
            <p className="mt-1 text-xs text-ink-3">This conversation isn&rsquo;t tied to an order yet.</p>
          </div>
        ) : (
          <OrderDetails order={order} />
        )}
      </div>
    </aside>
  );
}
