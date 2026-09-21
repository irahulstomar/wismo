// Thin client for the FastAPI backend. Base URL is overridable via NEXT_PUBLIC_API_BASE.
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

export type OrderStatus =
  | "not_yet_shipped"
  | "shipped"
  | "in_transit"
  | "delivered"
  | "delayed";

export type Channel = "website" | "instagram" | "whatsapp" | "email";

export type ConversationStatus = "bot_handled" | "needs_human" | "resolved";

export interface OrderItem {
  name: string;
  qty: number;
}

export interface Order {
  id: number;
  order_no: string;
  customer_name: string;
  customer_email: string;
  status: OrderStatus;
  carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  ordered_date: string;
  eta_date: string | null;
  delivered_date: string | null;
  items: OrderItem[];
  ship_city: string;
  ship_state: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  ts: string;
}

export interface ConversationSummary {
  id: number;
  channel: Channel;
  customer_name: string | null;
  customer_email: string | null;
  order_no: string | null;
  status: ConversationStatus;
  created_at: string;
  updated_at: string;
  last_message: string;
  message_count: number;
}

export interface Conversation extends Omit<ConversationSummary, "last_message" | "message_count"> {
  messages: Message[];
}

export interface ChatResponse {
  reply: string;
  conversation_id: number;
  status: ConversationStatus;
  order_no: string | null;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export function getConversations(): Promise<ConversationSummary[]> {
  return getJson("/conversations");
}

export function getConversation(id: number): Promise<Conversation> {
  return getJson(`/conversations/${id}`);
}

export function getOrder(orderNo: string): Promise<Order> {
  return getJson(`/orders/${encodeURIComponent(orderNo)}`);
}

export function listOrders(): Promise<Order[]> {
  return getJson("/orders");
}

export async function sendChat(params: {
  message: string;
  channel?: Channel;
  conversationId?: number;
}): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: params.message,
      channel: params.channel ?? "website",
      conversation_id: params.conversationId ?? null,
    }),
  });
  if (!res.ok) throw new Error(`POST /chat failed: ${res.status}`);
  return res.json() as Promise<ChatResponse>;
}
