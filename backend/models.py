"""Pydantic request/response models for the FastAPI layer."""

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    conversation_id: int | None = None
    channel: str = "website"


class ChatResponse(BaseModel):
    reply: str
    conversation_id: int
    status: str  # bot_handled | needs_human | resolved
    order_no: str | None = None
