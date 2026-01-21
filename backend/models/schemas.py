from pydantic import BaseModel
from typing import Optional, Literal

class RetrievalResult(BaseModel):
    """Single retrieval result from RAG system."""
    content: str
    source: str
    score: float
    type: str  # "contact", "event", or "general"

class RetrievalResponse(BaseModel):
    """Response from /api/chat endpoint (Phase 2 - raw retrieval)."""
    query: str
    results: list[RetrievalResult]
    message: Optional[str] = None  # For empty results fallback

class ChatRequest(BaseModel):
    """Request body for legacy /api/chat endpoint (Phase 2)."""
    message: str

class HealthResponse(BaseModel):
    """Response from /health endpoint."""
    status: str
    version: str

# --- Agent schemas (Phase 3) ---

class MessageItem(BaseModel):
    """Single message in conversation history.

    Matches AI SDK v6 message format.
    """
    role: Literal["user", "assistant", "system"]
    content: str

class AgentChatRequest(BaseModel):
    """Request body for streaming agent /api/chat endpoint.

    Accepts messages array matching AI SDK useChat format.
    """
    messages: list[MessageItem]

class AgentChatError(BaseModel):
    """Error response for agent endpoint."""
    error: str
    detail: Optional[str] = None
