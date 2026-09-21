"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, ArrowUp, Paperclip, UserRound, CheckCheck } from "lucide-react";
import { sendChat, getOrder, type Order } from "@/lib/api";
import { OrderCard } from "./order-card";
import { CompassMark } from "./logo";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: string;
  order?: Order | null;
  handoff?: boolean;
};

const SUGGESTIONS = ["Where's my order #1007?", "Is #1011 here yet?", "I need a refund", "Track by email"];

let idCounter = 0;
const nextId = () => `m${++idCounter}`;
const nowTime = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "greeting",
      role: "assistant",
      content:
        "Hi! I'm the Northbound assistant. Share your order number (like #1007) or the email you used at checkout, and I'll track it down.",
      ts: nowTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  // Let the storefront hero's "Track your order" button open the widget.
  useEffect(() => {
    const openChat = () => setOpen(true);
    window.addEventListener("northbound:open-chat", openChat);
    return () => window.removeEventListener("northbound:open-chat", openChat);
  }, []);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setMessages((m) => [...m, { id: nextId(), role: "user", content: trimmed, ts: nowTime() }]);
    setInput("");
    setLoading(true);

    try {
      const res = await sendChat({ message: trimmed, conversationId: conversationId ?? undefined });
      setConversationId(res.conversation_id);

      let order: Order | null = null;
      if (res.order_no) {
        try {
          order = await getOrder(res.order_no);
        } catch {
          order = null;
        }
      }

      setMessages((m) => [
        ...m,
        {
          id: nextId(),
          role: "assistant",
          content: res.reply,
          ts: nowTime(),
          order,
          handoff: res.status === "needs_human",
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: nextId(),
          role: "assistant",
          content: "Sorry — I couldn't reach the system just now. Please try again in a moment.",
          ts: nowTime(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Launcher */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full text-brand-fg shadow-lg"
        style={{ background: "var(--brand)" }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "open"}
            initial={{ rotate: -30, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 30, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {open ? <X size={22} /> : <MessageSquare size={22} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 flex h-[600px] max-h-[calc(100vh-7rem)] w-[390px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-[20px] border border-line bg-raised shadow-2xl"
          >
            {/* Header */}
            <header
              className="flex items-center gap-3 px-4 py-3.5 text-brand-fg"
              style={{ background: "var(--brand)" }}
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/95">
                <CompassMark size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold leading-tight">Northbound Assistant</p>
                <p className="flex items-center gap-1.5 text-xs text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#4ade80" }} />
                  Replies instantly
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </header>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-canvas px-4 py-4">
              {messages.map((m) => (
                <Bubble key={m.id} message={m} />
              ))}
              {loading && <TypingBubble />}
            </div>

            {/* Suggestions — always available, horizontally scrollable */}
            {!loading && (
              <div className="flex gap-2 overflow-x-auto border-t border-line-soft px-4 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="shrink-0 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Composer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 px-3 pt-2"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-line bg-inset px-3 focus-within:border-line-strong">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message…"
                  className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-ink outline-none placeholder:text-ink-muted"
                />
                <button type="button" className="text-ink-3 transition-colors hover:text-ink" aria-label="Attach">
                  <Paperclip size={16} />
                </button>
              </div>
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-brand-fg transition-opacity disabled:opacity-40"
                style={{ background: "var(--brand)" }}
                aria-label="Send"
              >
                <ArrowUp size={18} />
              </button>
            </form>
            <p className="py-2 text-center text-[10px] text-ink-muted">Powered by Northbound</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`max-w-[88%] ${isUser ? "" : "w-full"}`}>
        <div
          className="rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
          style={
            isUser
              ? { background: "var(--brand)", color: "var(--brand-fg)", borderBottomRightRadius: 6 }
              : { background: "var(--surface)", color: "var(--ink)", borderBottomLeftRadius: 6 }
          }
        >
          {message.content}
        </div>

        {message.order && <div className="mt-2">{<OrderCard order={message.order} />}</div>}

        {message.handoff && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-medium text-ink-2">
            <UserRound size={13} style={{ color: "var(--needs)" }} />
            Connected to a human
          </div>
        )}

        <div className={`mt-1 flex items-center gap-1 px-1 ${isUser ? "justify-end" : "justify-start"}`}>
          <span className="text-[10px] text-ink-muted">{message.ts}</span>
          {isUser && <CheckCheck size={12} className="text-ink-muted" />}
        </div>
      </div>
    </motion.div>
  );
}

function TypingBubble() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
      <div className="rounded-2xl px-4 py-3" style={{ background: "var(--surface)", borderBottomLeftRadius: 6 }}>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--ink-muted)" }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
