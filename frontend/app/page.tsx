import Link from "next/link";
import {
  Search,
  ShoppingBag,
  Coffee,
  Headphones,
  Smartphone,
  Lamp,
  GlassWater,
  Bed,
  Notebook,
  Speaker,
  Truck,
  RotateCcw,
  ShieldCheck,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { ChatWidget } from "@/components/chat-widget";
import { OpenChatButton } from "@/components/open-chat-button";
import { OrderCard } from "@/components/order-card";
import type { Order } from "@/lib/api";

type Product = { name: string; price: number; tag: string; Icon: LucideIcon };

const PRODUCTS: Product[] = [
  { name: "Field Mug", price: 36, tag: "NEW", Icon: Coffee },
  { name: "Wave Headphones", price: 199, tag: "AUDIO", Icon: Headphones },
  { name: "Stand Dock", price: 79, tag: "DESK", Icon: Smartphone },
  { name: "Stone Table Lamp", price: 89, tag: "HOME", Icon: Lamp },
  { name: "Brew Carafe", price: 49, tag: "KITCHEN", Icon: GlassWater },
  { name: "Throw Blanket", price: 69, tag: "HOME", Icon: Bed },
  { name: "Notebook Set", price: 24, tag: "DESK", Icon: Notebook },
  { name: "Portable Speaker", price: 129, tag: "AUDIO", Icon: Speaker },
];

const NAV = ["New", "Audio", "Desk", "Home", "Kitchen"];

// Static demo order for the hero status card (matches the mockup).
const HERO_ORDER: Order = {
  id: 1007,
  order_no: "#1007",
  customer_name: "Sarah Johnson",
  customer_email: "sarah.johnson@email.com",
  status: "in_transit",
  carrier: "UPS",
  tracking_number: "1Z9Y44820392573045",
  tracking_url: "https://www.ups.com/track?tracknum=1Z9Y44820392573045",
  ordered_date: "2026-07-04",
  eta_date: "2026-07-10",
  delivered_date: null,
  items: [
    { name: "Wave Headphones", qty: 1 },
    { name: "Field Mug", qty: 1 },
  ],
  ship_city: "Austin",
  ship_state: "TX",
};

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <StoreHeader />
      <main className="flex-1">
        <Hero />
        <ProductGrid />
        <TrustStrip />
      </main>
      <StoreFooter />
      <ChatWidget />
    </div>
  );
}

function StoreHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
        <Logo />
        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <a key={item} href="#shop" className="text-sm font-medium text-ink-2 transition-colors hover:text-ink">
              {item}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-line bg-inset px-3 py-2 text-ink-3 sm:flex">
            <Search size={15} />
            <span className="text-sm">Search products, orders…</span>
          </div>
          <button className="relative grid h-10 w-10 place-items-center rounded-full border border-line bg-surface text-ink-2 transition-colors hover:text-ink">
            <ShoppingBag size={18} />
            <span
              className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full text-[10px] font-semibold text-brand-fg"
              style={{ background: "var(--brand)" }}
            >
              2
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium uppercase tracking-wide text-ink-2">
          <Truck size={13} style={{ color: "var(--brand)" }} />
          Free 2-day shipping
        </span>
        <h1 className="mt-5 font-display text-6xl font-semibold leading-[0.95] tracking-tight text-ink">
          Gear that
          <br />
          gets there.
        </h1>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-2">
          Thoughtful goods for home, work, and everything in between.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <a
            href="#shop"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-brand-fg shadow-sm transition-colors"
            style={{ background: "var(--brand)" }}
          >
            Shop new arrivals
            <ArrowRight size={16} />
          </a>
          <OpenChatButton className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-line-strong">
            Track your order
          </OpenChatButton>
        </div>
      </div>

      {/* Hero status card — the signature journey rail, front and center */}
      <div className="relative mx-auto w-full max-w-xs">
        <div className="absolute -inset-4 -z-10 rounded-[28px] bg-inset/60" />
        <OrderCard order={HERO_ORDER} subtitle="Your recent order · Arriving Jul 10" className="shadow-xl" />
      </div>
    </section>
  );
}

function ProductGrid() {
  return (
    <section id="shop" className="mx-auto max-w-6xl px-6 py-6">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">Featured this week</h2>
        <a href="#shop" className="text-sm font-medium text-ink-3 transition-colors hover:text-ink">
          View all
        </a>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {PRODUCTS.map((p) => (
          <ProductCard key={p.name} product={p} />
        ))}
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { Icon } = product;
  return (
    <div className="group overflow-hidden rounded-[18px] border border-line bg-surface shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="grid aspect-square place-items-center bg-inset/70">
        <Icon size={52} strokeWidth={1.25} className="text-ink-2 transition-transform group-hover:scale-105" />
      </div>
      <div className="px-4 py-3.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">{product.tag}</p>
        <div className="mt-1 flex items-center justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{product.name}</p>
            <p className="font-mono text-sm text-ink-2">${product.price}.00</p>
          </div>
          <button
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line text-ink-2 transition-colors hover:bg-inset hover:text-ink"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function TrustStrip() {
  const items = [
    { Icon: Truck, title: "Free 2-day shipping", sub: "On all orders, always." },
    { Icon: RotateCcw, title: "30-day returns", sub: "Easy returns, no hassle." },
    { Icon: ShieldCheck, title: "US-based support", sub: "Real people. Real help." },
  ];
  return (
    <section className="mx-auto max-w-6xl px-6 py-14">
      <div className="grid gap-6 sm:grid-cols-3">
        {items.map(({ Icon, title, sub }) => (
          <div key={title} className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-inset text-ink-2">
              <Icon size={20} />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">{title}</p>
              <p className="text-xs text-ink-3">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StoreFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row">
        <Logo />
        <nav className="flex items-center gap-6 text-sm text-ink-3">
          {["About", "Support", "Returns", "Terms", "Privacy"].map((l) => (
            <a key={l} href="#" className="transition-colors hover:text-ink">
              {l}
            </a>
          ))}
        </nav>
        <Link href="/dashboard" className="text-sm font-medium text-ink-2 transition-colors hover:text-ink">
          Owner dashboard →
        </Link>
      </div>
    </footer>
  );
}
