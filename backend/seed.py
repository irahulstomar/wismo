"""Seed the WISMO SQLite database with fake-but-realistic US order data.

Run:  python seed.py

Drops and recreates the DB each run so the demo stays reproducible. All data is fake;
emails use the reserved example.com domain. USD, US carriers (USPS/UPS/FedEx), US cities.
"""

from db import (
    DB_PATH,
    create_conversation,
    init_db,
    insert_order,
)


def tracking_url(carrier: str, number: str) -> str:
    return {
        "USPS": f"https://tools.usps.com/go/TrackConfirmAction?tLabels={number}",
        "UPS": f"https://www.ups.com/track?tracknum={number}",
        "FedEx": f"https://www.fedex.com/fedextrack/?trknbr={number}",
    }[carrier]


def order(
    order_no,
    name,
    email,
    status,
    ordered_date,
    items,
    city,
    state,
    carrier=None,
    tracking_number=None,
    eta_date=None,
    delivered_date=None,
):
    return {
        "order_no": order_no,
        "customer_name": name,
        "customer_email": email,
        "status": status,
        "carrier": carrier,
        "tracking_number": tracking_number,
        "tracking_url": tracking_url(carrier, tracking_number) if carrier else None,
        "ordered_date": ordered_date,
        "eta_date": eta_date,
        "delivered_date": delivered_date,
        "items": items,
        "ship_city": city,
        "ship_state": state,
    }


# Today (demo clock): 2026-07-08
ORDERS = [
    # --- not_yet_shipped (3): ordered, no carrier/tracking yet ---
    order("#1001", "Emma Johnson", "emma.johnson@example.com", "not_yet_shipped",
          "2026-07-07", [{"name": "Merino Wool Beanie", "qty": 1},
                         {"name": "Stainless Steel Water Bottle", "qty": 1}],
          "Austin", "TX", eta_date="2026-07-16"),
    order("#1002", "Liam Williams", "liam.williams@example.com", "not_yet_shipped",
          "2026-07-07", [{"name": "Wireless Earbuds Pro", "qty": 1}],
          "Denver", "CO", eta_date="2026-07-15"),
    order("#1003", "Olivia Brown", "olivia.brown@example.com", "not_yet_shipped",
          "2026-07-08", [{"name": "Cast Iron Skillet 12\"", "qty": 1},
                         {"name": "Bamboo Cutting Board", "qty": 1}],
          "Portland", "OR", eta_date="2026-07-17"),

    # --- shipped (3): label created / handed to carrier ---
    order("#1004", "Noah Davis", "noah.davis@example.com", "shipped",
          "2026-07-05", [{"name": "Standing Desk Mat", "qty": 1}],
          "Chicago", "IL", carrier="UPS", tracking_number="1Z999AA10123456784",
          eta_date="2026-07-12"),
    order("#1005", "Ava Miller", "ava.miller@example.com", "shipped",
          "2026-07-05", [{"name": "Mechanical Keyboard", "qty": 1},
                         {"name": "USB-C Charging Hub", "qty": 1}],
          "Seattle", "WA", carrier="USPS", tracking_number="9400111899560001234501",
          eta_date="2026-07-13"),
    order("#1006", "Ethan Wilson", "ethan.wilson@example.com", "shipped",
          "2026-07-06", [{"name": "Linen Throw Pillow", "qty": 2}],
          "Nashville", "TN", carrier="FedEx", tracking_number="612345678901",
          eta_date="2026-07-13"),

    # --- in_transit (5): moving through the network ---
    order("#1007", "Sarah Johnson", "sarah.johnson@email.com", "in_transit",
          "2026-07-04", [{"name": "Wave Headphones", "qty": 1},
                         {"name": "Field Mug", "qty": 1}],
          "Austin", "TX", carrier="UPS", tracking_number="1Z9Y44820392573045",
          eta_date="2026-07-10"),
    order("#1008", "Mason Taylor", "mason.taylor@example.com", "in_transit",
          "2026-07-04", [{"name": "Ceramic Pour-Over Set", "qty": 1}],
          "Phoenix", "AZ", carrier="UPS", tracking_number="1Z999AA10123456795",
          eta_date="2026-07-11"),
    order("#1009", "Isabella Anderson", "isabella.anderson@example.com", "in_transit",
          "2026-07-04", [{"name": "Smart LED Desk Lamp", "qty": 1}],
          "Minneapolis", "MN", carrier="USPS", tracking_number="9400111899560001234502",
          eta_date="2026-07-11"),
    order("#1010", "James Thomas", "james.thomas@example.com", "in_transit",
          "2026-07-03", [{"name": "Organic Cotton Bath Towels (Set of 4)", "qty": 1}],
          "Atlanta", "GA", carrier="UPS", tracking_number="1Z999AA10123456806",
          eta_date="2026-07-10"),
    order("#1018", "Alexander Lee", "alexander.lee@example.com", "in_transit",
          "2026-07-05", [{"name": "Wireless Charging Pad", "qty": 1},
                         {"name": "Phone Stand", "qty": 1}],
          "Pittsburgh", "PA", carrier="FedEx", tracking_number="612345678905",
          eta_date="2026-07-12"),

    # --- delivered (4): eta was the promised date; delivered_date is when it landed ---
    order("#1011", "Mia Jackson", "mia.jackson@example.com", "delivered",
          "2026-06-27", [{"name": "Leather Card Wallet", "qty": 1}],
          "San Diego", "CA", carrier="FedEx", tracking_number="612345678903",
          eta_date="2026-07-02", delivered_date="2026-07-02"),
    order("#1012", "Benjamin White", "benjamin.white@example.com", "delivered",
          "2026-06-28", [{"name": "Portable Bluetooth Speaker", "qty": 1}],
          "Columbus", "OH", carrier="USPS", tracking_number="9400111899560001234503",
          eta_date="2026-07-03", delivered_date="2026-07-03"),
    order("#1013", "Charlotte Harris", "charlotte.harris@example.com", "delivered",
          "2026-06-29", [{"name": "Scented Soy Candle Set", "qty": 1}],
          "Raleigh", "NC", carrier="UPS", tracking_number="1Z999AA10123456817",
          eta_date="2026-07-04", delivered_date="2026-07-04"),
    order("#1014", "Lucas Martin", "lucas.martin@example.com", "delivered",
          "2026-06-30", [{"name": "Fitness Tracker Band", "qty": 1}],
          "Salt Lake City", "UT", carrier="USPS", tracking_number="9400111899560001234504",
          eta_date="2026-07-05", delivered_date="2026-07-05"),

    # --- delayed (3): eta already passed, still not delivered ---
    order("#1015", "Amelia Thompson", "amelia.thompson@example.com", "delayed",
          "2026-06-29", [{"name": "4K Webcam", "qty": 1}],
          "Kansas City", "MO", carrier="UPS", tracking_number="1Z999AA10123456828",
          eta_date="2026-07-05"),
    order("#1016", "Henry Garcia", "henry.garcia@example.com", "delayed",
          "2026-06-30", [{"name": "Insulated Travel Mug", "qty": 2}],
          "Miami", "FL", carrier="FedEx", tracking_number="612345678904",
          eta_date="2026-07-06"),
    order("#1017", "Harper Martinez", "harper.martinez@example.com", "delayed",
          "2026-06-30", [{"name": "Weighted Blanket 15 lb", "qty": 1}],
          "Sacramento", "CA", carrier="USPS", tracking_number="9400111899560001234505",
          eta_date="2026-07-06"),
]


def msg(role, content, ts):
    return {"role": role, "content": content, "ts": ts}


def _c(**kwargs):
    """create_conversation, defaulting created/updated to the last message's ts."""
    messages = kwargs.get("messages") or []
    if messages:
        kwargs.setdefault("created_at", messages[0]["ts"])
        kwargs.setdefault("updated_at", messages[-1]["ts"])
    create_conversation(**kwargs)


def seed_conversations():
    """Seeded threads so the dashboard inbox reads full on camera. Customer names on
    order-linked threads match the order's customer, so the order panel stays consistent.
    The live storefront widget adds new Website threads on top of these.
    """
    # 1. Website — active, in transit (matches hero #1007 / mockup)
    _c(channel="website", customer_name="Sarah Johnson", customer_email="sarah.johnson@email.com",
       order_no="#1007", status="bot_handled",
       messages=[
           msg("user", "Where's my order #1007?", "2026-07-08T09:41:00+00:00"),
           msg("assistant",
               "Let me check that for you. Order #1007 is in transit with UPS and is estimated "
               "to arrive Jul 10 in Austin, TX. Track it here: "
               "https://www.ups.com/track?tracknum=1Z9Y44820392573045",
               "2026-07-08T09:41:06+00:00"),
       ])

    # 2. Website — needs human, delayed package, order not found
    _c(channel="website", customer_name="Mike Davis", status="needs_human",
       messages=[
           msg("user", "I think my package is delayed and I can't find my order number",
               "2026-07-08T09:32:00+00:00"),
           msg("assistant",
               "I'm sorry to hear that. I couldn't locate an order from this chat, so I'm "
               "connecting you with a teammate who can look it up and help right away.",
               "2026-07-08T09:32:05+00:00"),
       ])

    # 3. Instagram — bot handled, in transit
    _c(channel="instagram", customer_name="Mason Taylor", order_no="#1008", status="bot_handled",
       messages=[
           msg("user", "where's my order #1008?", "2026-07-08T09:21:00+00:00"),
           msg("assistant",
               "Hi Mason! Order #1008 (Ceramic Pour-Over Set) is in transit with UPS, estimated "
               "to arrive Jul 11 in Phoenix, AZ. Track it here: "
               "https://www.ups.com/track?tracknum=1Z999AA10123456795",
               "2026-07-08T09:21:05+00:00"),
       ])

    # 4. Email — needs human, refund request (out of scope -> handoff)
    _c(channel="email", customer_name="Amelia Thompson",
       customer_email="amelia.thompson@example.com", order_no="#1015", status="needs_human",
       messages=[
           msg("user", "My order #1015 is late again. I'd like a refund.",
               "2026-07-08T09:15:00+00:00"),
           msg("assistant",
               "I'm sorry #1015 is running behind — it's currently delayed past its Jul 5 "
               "estimate. Refunds are handled by our team, so I'm connecting you with a human "
               "who can sort that out right away.",
               "2026-07-08T09:15:05+00:00"),
       ])

    # 5. Website — bot handled, not yet shipped
    _c(channel="website", customer_name="Emma Johnson", customer_email="emma.johnson@example.com",
       order_no="#1001", status="bot_handled",
       messages=[
           msg("user", "when will my order #1001 ship?", "2026-07-08T08:40:00+00:00"),
           msg("assistant",
               "Hi Emma! Order #1001 hasn't shipped yet — it's being prepared and is estimated "
               "to arrive by Jul 16. I'll have tracking for you as soon as it's on its way.",
               "2026-07-08T08:40:05+00:00"),
       ])

    # 6. Instagram — needs human, product question (out of scope -> handoff)
    _c(channel="instagram", customer_name="Henry Garcia", status="needs_human",
       messages=[
           msg("user", "do the wave headphones work with an iphone?",
               "2026-07-08T08:05:00+00:00"),
           msg("assistant",
               "Great question! Product details aren't something I can speak to — I'm looping in "
               "a teammate who can give you the specifics.",
               "2026-07-08T08:05:04+00:00"),
       ])

    # 7. Email — bot handled, delayed order
    _c(channel="email", customer_name="Harper Martinez",
       customer_email="harper.martinez@example.com", order_no="#1017", status="bot_handled",
       messages=[
           msg("user", "order #1017 hasn't arrived, what's going on?",
               "2026-07-08T07:50:00+00:00"),
           msg("assistant",
               "Sorry for the wait, Harper. Order #1017 (Weighted Blanket) is delayed — it was "
               "estimated for Jul 6 but is still with USPS. Latest tracking: "
               "https://tools.usps.com/go/TrackConfirmAction?tLabels=9400111899560001234505",
               "2026-07-08T07:50:07+00:00"),
       ])

    # 8. WhatsApp — needs human, address change (out of scope -> handoff)
    _c(channel="whatsapp", customer_name="Jordan Lee", status="needs_human",
       messages=[
           msg("user", "can I change the shipping address on my order?",
               "2026-07-08T07:15:00+00:00"),
           msg("assistant",
               "I can't edit orders myself, but I'm connecting you with a teammate who can update "
               "the address if it hasn't shipped yet.",
               "2026-07-08T07:15:04+00:00"),
       ])

    # 9. WhatsApp — resolved, shipped order
    _c(channel="whatsapp", customer_name="Noah Davis", order_no="#1004", status="resolved",
       messages=[
           msg("user", "hey where's #1004", "2026-07-07T18:05:00+00:00"),
           msg("assistant",
               "Hi Noah! Order #1004 (Standing Desk Mat) has shipped via UPS and is estimated to "
               "arrive Jul 12 in Chicago, IL. Track it here: "
               "https://www.ups.com/track?tracknum=1Z999AA10123456784",
               "2026-07-07T18:05:05+00:00"),
           msg("user", "perfect ty", "2026-07-07T18:06:00+00:00"),
       ])

    # 10. Email — resolved, delivered order
    _c(channel="email", customer_name="Charlotte Harris",
       customer_email="charlotte.harris@example.com", order_no="#1013", status="resolved",
       messages=[
           msg("user", "did my order #1013 arrive?", "2026-07-07T16:18:00+00:00"),
           msg("assistant",
               "Yes! Order #1013 (Scented Soy Candle Set) was delivered on Jul 4 via UPS to "
               "Raleigh, NC. Anything else I can help with?",
               "2026-07-07T16:18:06+00:00"),
           msg("user", "nope, thank you!", "2026-07-07T16:20:00+00:00"),
       ])

    # 11. Instagram — resolved, delivered order
    _c(channel="instagram", customer_name="Mia Jackson", order_no="#1011", status="resolved",
       messages=[
           msg("user", "hi! is my order here yet? order #1011", "2026-07-07T15:02:00+00:00"),
           msg("assistant",
               "Hi Mia! Good news — order #1011 was delivered on Jul 2 via FedEx to San Diego, "
               "CA. Let me know if it didn't turn up and I'll get a human on it!",
               "2026-07-07T15:02:04+00:00"),
           msg("user", "found it on the porch, thanks!", "2026-07-07T15:05:00+00:00"),
       ])


def main():
    if DB_PATH.exists():
        DB_PATH.unlink()
        print(f"Removed existing {DB_PATH.name}")

    init_db()
    for o in ORDERS:
        insert_order(o)
    seed_conversations()

    # Summary
    from collections import Counter
    from db import get_connection

    with get_connection() as conn:
        statuses = Counter(
            r["status"] for r in conn.execute("SELECT status FROM orders").fetchall()
        )
        n_orders = conn.execute("SELECT COUNT(*) c FROM orders").fetchone()["c"]
        n_convos = conn.execute("SELECT COUNT(*) c FROM conversations").fetchone()["c"]

    print(f"Seeded {n_orders} orders:")
    for status, count in statuses.items():
        print(f"  {status:>16}: {count}")
    print(f"Seeded {n_convos} conversations.")


if __name__ == "__main__":
    main()
