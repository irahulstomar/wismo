"use client";

import { useState } from "react";
import { Globe, Camera, MessageCircle, Mail, Bot, type LucideIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-line px-6 pb-4 pt-5">
        <h1 className="font-display text-xl font-semibold tracking-tight text-ink">Settings</h1>
        <p className="mt-0.5 text-sm text-ink-3">Store profile, channels &amp; the assistant</p>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="mx-auto max-w-3xl space-y-5">
          <StoreProfile />
          <Channels />
          <Assistant />
        </div>
      </div>
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-ink-3">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-3">{label}</span>
      <div className="rounded-xl border border-line bg-inset px-3.5 py-2.5 text-sm text-ink">{value}</div>
    </label>
  );
}

function StoreProfile() {
  return (
    <Card title="Store profile">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Store name" value="Northbound Supply Co." />
        <Field label="Support email" value="support@northbound.co" />
        <Field label="Currency" value="USD ($)" />
        <Field label="Timezone" value="Eastern Time (ET)" />
      </div>
    </Card>
  );
}

const CHANNELS: { icon: LucideIcon; name: string; handle: string }[] = [
  { icon: Globe, name: "Website", handle: "northbound.co" },
  { icon: Camera, name: "Instagram", handle: "@northboundsupply" },
  { icon: MessageCircle, name: "WhatsApp", handle: "+1 (555) 010-0199" },
  { icon: Mail, name: "Email", handle: "support@northbound.co" },
];

function Channels() {
  return (
    <Card title="Channels" subtitle="One assistant answers across every channel">
      <div className="divide-y divide-line-soft">
        {CHANNELS.map(({ icon: Icon, name, handle }) => (
          <div key={name} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-line bg-inset text-ink-2">
              <Icon size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">{name}</p>
              <p className="truncate text-xs text-ink-3">{handle}</p>
            </div>
            <span className="text-xs font-medium" style={{ color: "var(--delivered)" }}>
              Connected
            </span>
            <Toggle defaultOn />
          </div>
        ))}
      </div>
    </Card>
  );
}

function Assistant() {
  const tones = ["Warm & concise", "Formal", "Playful"];
  const [tone, setTone] = useState(tones[0]);
  const handoffTopics = ["Refunds", "Returns", "Product questions", "Cancellations"];

  return (
    <Card title="Assistant" subtitle="How the order-status bot behaves">
      <div className="space-y-5">
        <div className="flex items-center gap-3 rounded-xl border border-line bg-inset px-3.5 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-full text-brand-fg" style={{ background: "var(--brand)" }}>
            <Bot size={17} />
          </span>
          <div>
            <p className="text-sm font-medium text-ink">Gemini 2.5 Flash</p>
            <p className="text-xs text-ink-3">Function calling · order lookup</p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-ink-3">Reply tone</p>
          <div className="flex flex-wrap gap-2">
            {tones.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  tone === t ? "bg-ink text-canvas" : "border border-line text-ink-2 hover:border-line-strong"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-ink-3">Hand off to a human for</p>
          <div className="flex flex-wrap gap-2">
            {handoffTopics.map((t) => (
              <span
                key={t}
                className="rounded-md border border-line bg-inset px-2.5 py-1 text-xs font-medium text-ink-2"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-line-soft pt-4">
          <div>
            <p className="text-sm font-medium text-ink">Reply outside business hours</p>
            <p className="text-xs text-ink-3">Mon–Fri, 9am–6pm ET</p>
          </div>
          <Toggle defaultOn />
        </div>
      </div>
    </Card>
  );
}

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => setOn((o) => !o)}
      className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
      style={{ background: on ? "var(--brand)" : "var(--line-strong)" }}
    >
      <span
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all"
        style={{ left: on ? "22px" : "2px" }}
      />
    </button>
  );
}
