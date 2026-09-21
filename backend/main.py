"""FastAPI app for the WISMO bot.

Data + lookup core, conversation persistence, and /chat backed by the Gemini
function-calling brain (get_order / request_human_handoff).
"""

from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import db
import gemini_client
from models import ChatRequest, ChatResponse

# Load backend/.env explicitly so the key resolves regardless of launch directory.
load_dotenv(Path(__file__).with_name(".env"))

app = FastAPI(title="WISMO Order-Status Bot")

# Local demo only — the Next.js dev server runs on :3000.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup() -> None:
    db.init_db()


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/orders")
def read_orders() -> list[dict]:
    """All orders — for the dashboard Orders view and Analytics."""
    return db.list_orders()


@app.get("/orders/{order_no}")
def read_order(order_no: str) -> dict:
    """Order context for the dashboard's linked-order panel."""
    order = db.get_order(order_no=order_no)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@app.get("/conversations")
def read_conversations() -> list[dict]:
    return db.list_conversations()


@app.get("/conversations/{conversation_id}")
def read_conversation(conversation_id: int) -> dict:
    convo = db.get_conversation(conversation_id)
    if convo is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return convo


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    """Run the customer message through the Gemini function-calling brain and persist the turn."""
    if req.channel not in db.CHANNELS:
        raise HTTPException(status_code=400, detail=f"Unknown channel: {req.channel}")

    if req.conversation_id is None:
        conversation_id = db.create_conversation(channel=req.channel)
    else:
        if db.get_conversation(req.conversation_id) is None:
            raise HTTPException(status_code=404, detail="Conversation not found")
        conversation_id = req.conversation_id

    db.append_message(conversation_id, "user", req.message)

    # Build history from the full thread (includes the message we just appended).
    convo = db.get_conversation(conversation_id)
    history = [{"role": m["role"], "content": m["content"]} for m in convo["messages"]]

    reply, handoff, matched_order_no = gemini_client.run_chat(history)

    db.append_message(conversation_id, "assistant", reply)
    if handoff:
        db.set_conversation_status(conversation_id, "needs_human")
    if matched_order_no:
        db.set_conversation_order(conversation_id, matched_order_no)
        order = db.get_order(order_no=matched_order_no)
        if order:
            db.set_conversation_customer(
                conversation_id, order["customer_name"], order["customer_email"]
            )

    convo = db.get_conversation(conversation_id)
    return ChatResponse(
        reply=reply,
        conversation_id=conversation_id,
        status=convo["status"],
        order_no=convo["order_no"],
    )
