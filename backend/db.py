"""SQLite layer for the WISMO bot.

Two tables only (per CLAUDE.md): `orders` and `conversations`. Conversation messages
are stored as a JSON column on `conversations` rather than in a third table.

`get_order()` is the seam where a real Shopify Admin API would plug in later — keep it clean.
Lookups are exact-match only so one customer can never see another's order.
"""

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = Path(__file__).parent / "wismo.db"

# --- Enumerable values (kept here so seed.py and the Gemini layer share one source) ---
ORDER_STATUSES = ("not_yet_shipped", "shipped", "in_transit", "delivered", "delayed")
CHANNELS = ("website", "instagram", "whatsapp", "email")
CONVERSATION_STATUSES = ("bot_handled", "needs_human", "resolved")


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Create tables if they don't exist. Safe to call on every startup."""
    with get_connection() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS orders (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                order_no        TEXT UNIQUE NOT NULL,
                customer_name   TEXT NOT NULL,
                customer_email  TEXT NOT NULL,
                status          TEXT NOT NULL,
                carrier         TEXT,
                tracking_number TEXT,
                tracking_url    TEXT,
                ordered_date    TEXT NOT NULL,
                eta_date        TEXT,
                delivered_date  TEXT,
                items           TEXT NOT NULL,   -- JSON: [{"name": str, "qty": int}]
                ship_city       TEXT NOT NULL,
                ship_state      TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS conversations (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                channel         TEXT NOT NULL,
                customer_name   TEXT,
                customer_email  TEXT,
                order_no        TEXT,
                status          TEXT NOT NULL DEFAULT 'bot_handled',
                messages        TEXT NOT NULL DEFAULT '[]',  -- JSON: [{"role","content","ts"}]
                created_at      TEXT NOT NULL,
                updated_at      TEXT NOT NULL
            );
            """
        )


def _order_to_dict(row: sqlite3.Row) -> dict:
    order = dict(row)
    order["items"] = json.loads(order["items"])
    return order


# --- Orders -------------------------------------------------------------------

def get_order(order_no: str | None = None, email: str | None = None) -> dict | None:
    """Look up a single order by exact order number OR exact email.

    Returns the order as a dict (with `items` parsed), or None if not found.
    Matching is case-insensitive on the trimmed value; a leading '#' on the order
    number is optional. Exact-match only — no partial/fuzzy matching that could
    leak another customer's order.
    """
    order_no = (order_no or "").strip()
    email = (email or "").strip()

    with get_connection() as conn:
        if order_no:
            # Normalise: allow "#1001" or "1001" to match a stored "#1001".
            candidates = {order_no, order_no.lstrip("#"), f"#{order_no.lstrip('#')}"}
            for candidate in candidates:
                row = conn.execute(
                    "SELECT * FROM orders WHERE order_no = ? COLLATE NOCASE",
                    (candidate,),
                ).fetchone()
                if row:
                    return _order_to_dict(row)
            return None

        if email:
            row = conn.execute(
                "SELECT * FROM orders WHERE customer_email = ? COLLATE NOCASE",
                (email,),
            ).fetchone()
            return _order_to_dict(row) if row else None

    return None


def list_orders() -> list[dict]:
    """All orders (items parsed), most recently ordered first — for the Orders view."""
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM orders ORDER BY date(ordered_date) DESC, order_no DESC"
        ).fetchall()
    return [_order_to_dict(r) for r in rows]


def insert_order(order: dict) -> None:
    """Insert one order. `order['items']` may be a list (JSON-encoded here) or a string."""
    items = order["items"]
    if not isinstance(items, str):
        items = json.dumps(items)
    with get_connection() as conn:
        conn.execute(
            """
            INSERT INTO orders (
                order_no, customer_name, customer_email, status, carrier,
                tracking_number, tracking_url, ordered_date, eta_date,
                delivered_date, items, ship_city, ship_state
            ) VALUES (
                :order_no, :customer_name, :customer_email, :status, :carrier,
                :tracking_number, :tracking_url, :ordered_date, :eta_date,
                :delivered_date, :items, :ship_city, :ship_state
            )
            """,
            {**order, "items": items},
        )


# --- Conversations ------------------------------------------------------------

def _conversation_to_dict(row: sqlite3.Row) -> dict:
    convo = dict(row)
    convo["messages"] = json.loads(convo["messages"])
    return convo


def list_conversations() -> list[dict]:
    """All conversations for the dashboard inbox, most recently updated first.

    Each item includes a `last_message` preview instead of the full thread.
    """
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM conversations ORDER BY datetime(updated_at) DESC"
        ).fetchall()

    summaries = []
    for row in rows:
        convo = _conversation_to_dict(row)
        messages = convo.pop("messages")
        convo["last_message"] = messages[-1]["content"] if messages else ""
        convo["message_count"] = len(messages)
        summaries.append(convo)
    return summaries


def get_conversation(conversation_id: int) -> dict | None:
    with get_connection() as conn:
        row = conn.execute(
            "SELECT * FROM conversations WHERE id = ?", (conversation_id,)
        ).fetchone()
    return _conversation_to_dict(row) if row else None


def create_conversation(
    channel: str,
    customer_name: str | None = None,
    customer_email: str | None = None,
    order_no: str | None = None,
    status: str = "bot_handled",
    messages: list[dict] | None = None,
    created_at: str | None = None,
    updated_at: str | None = None,
) -> int:
    ts = created_at or _now()
    with get_connection() as conn:
        cur = conn.execute(
            """
            INSERT INTO conversations (
                channel, customer_name, customer_email, order_no, status,
                messages, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                channel,
                customer_name,
                customer_email,
                order_no,
                status,
                json.dumps(messages or []),
                ts,
                updated_at or ts,
            ),
        )
        return cur.lastrowid


def append_message(conversation_id: int, role: str, content: str) -> None:
    """Append one message to a conversation and bump updated_at."""
    with get_connection() as conn:
        row = conn.execute(
            "SELECT messages FROM conversations WHERE id = ?", (conversation_id,)
        ).fetchone()
        if row is None:
            raise ValueError(f"conversation {conversation_id} not found")
        messages = json.loads(row["messages"])
        messages.append({"role": role, "content": content, "ts": _now()})
        conn.execute(
            "UPDATE conversations SET messages = ?, updated_at = ? WHERE id = ?",
            (json.dumps(messages), _now(), conversation_id),
        )


def set_conversation_status(conversation_id: int, status: str) -> None:
    with get_connection() as conn:
        conn.execute(
            "UPDATE conversations SET status = ?, updated_at = ? WHERE id = ?",
            (status, _now(), conversation_id),
        )


def set_conversation_order(conversation_id: int, order_no: str) -> None:
    with get_connection() as conn:
        conn.execute(
            "UPDATE conversations SET order_no = ?, updated_at = ? WHERE id = ?",
            (order_no, _now(), conversation_id),
        )


def set_conversation_customer(
    conversation_id: int, name: str | None = None, email: str | None = None
) -> None:
    """Fill customer_name/email only where not already set (COALESCE keeps existing)."""
    with get_connection() as conn:
        conn.execute(
            "UPDATE conversations SET "
            "customer_name = COALESCE(customer_name, ?), "
            "customer_email = COALESCE(customer_email, ?), "
            "updated_at = ? WHERE id = ?",
            (name, email, _now(), conversation_id),
        )
